// Craft Track backend
// Kør lokalt: npm install && npm start
// Endpoints: POST /api/parse-log  POST /api/wine-search
//            POST /api/user/create  POST /api/user/recover  POST /api/user/update
//            POST /api/log-entry   GET /api/health

const express = require("express");
const cors    = require("cors");
const path    = require("path");

const app = express();
app.use(cors());
app.use(express.json({ limit: "256kb" }));

const API_KEY        = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL   = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_KEY   = process.env.SUPABASE_SERVICE_KEY;
const PARSE_MODEL    = process.env.PARSE_MODEL || "claude-haiku-4-5-20251001";
const WINE_MODEL     = process.env.WINE_MODEL  || "claude-haiku-4-5-20251001";

// ---- Anthropic ----
async function callClaude({ model, system, content, maxTokens = 1000 }) {
  if (!API_KEY) throw new Error("ANTHROPIC_API_KEY mangler");
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model, max_tokens: maxTokens, system, messages: [{ role: "user", content }] }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error((data && data.error && data.error.message) || ("HTTP " + r.status));
  return (data.content || []).filter(b => b.type === "text").map(b => b.text).join("").trim();
}

function extractJSON(text) {
  const clean = (text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
  try { return JSON.parse(clean); } catch (_) {
    const m = clean.match(/[\[{][\s\S]*[\]}]/);
    if (m) { try { return JSON.parse(m[0]); } catch (__) {} }
  }
  return null;
}

// ---- Supabase ----
async function sb(path, opts = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Supabase ikke konfigureret");
  const method = opts.method || "GET";
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      ...(method !== "GET" ? { "Prefer": "return=representation" } : {}),
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error((data && data.message) || `HTTP ${res.status}`);
  return data;
}

// Generér læsbar genopretningskode — ingen tvetydige tegn
function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ---- Statiske filer ----
app.use(express.static(path.join(__dirname, "app")));
app.get("/", (_req, res) => res.sendFile(path.join(__dirname, "app", "mise.html")));
app.get("/api/health", (_req, res) => res.json({ ok: true, service: "craft-track" }));

// ---- Bruger: opret ----
app.post("/api/user/create", async (req, res) => {
  try {
    const { nickname, profession } = req.body || {};
    const code = genCode();
    const rows = await sb("users", {
      method: "POST",
      body: JSON.stringify({ code, nickname: nickname || null, profession: profession || null }),
    });
    res.json({ id: rows[0].id, code: rows[0].code });
  } catch (err) {
    console.error("user/create:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---- Bruger: genopret via kode ----
app.post("/api/user/recover", async (req, res) => {
  try {
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ error: "Kode mangler" });
    const rows = await sb(`users?code=eq.${encodeURIComponent(code.trim().toUpperCase())}`);
    if (!rows || !rows.length) return res.status(404).json({ error: "not_found" });
    const u = rows[0];
    res.json({ id: u.id, code: u.code, nickname: u.nickname, profession: u.profession });
  } catch (err) {
    console.error("user/recover:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---- Bruger: opdatér kaldenavn/profession ----
app.post("/api/user/update", async (req, res) => {
  try {
    const { id, nickname, profession } = req.body || {};
    if (!id) return res.status(400).json({ error: "ID mangler" });
    await sb(`users?id=eq.${id}`, {
      method: "PATCH",
      body: JSON.stringify({ nickname: nickname || null, profession: profession || null }),
    });
    res.json({ ok: true });
  } catch (err) {
    console.error("user/update:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---- Log-indgang ----
app.post("/api/log-entry", async (req, res) => {
  try {
    const { userId, categoryLabel } = req.body || {};
    let { delta } = req.body || {};
    delta = parseInt(delta, 10);
    if (!userId || !categoryLabel || !delta) return res.status(400).json({ error: "Felter mangler" });

    // Find eller opret kategori
    const existing = await sb(`categories?label_da=eq.${encodeURIComponent(categoryLabel)}&select=id`);
    let categoryId;
    if (existing && existing.length) {
      categoryId = existing[0].id;
    } else {
      const created = await sb("categories", {
        method: "POST",
        body: JSON.stringify({ label_da: categoryLabel }),
      });
      categoryId = created[0].id;
    }

    await sb("log_entries", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, category_id: categoryId, delta }),
    });
    res.json({ ok: true });
  } catch (err) {
    console.error("log-entry:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---- Parse fritekst ----
app.post("/api/parse-log", async (req, res) => {
  try {
    const { text, counters = [], wines = [] } = req.body || {};
    if (!text || !String(text).trim()) return res.json({ actions: [] });

    const content =
      'Eksisterende tællere (med underkategorier og mulige typer): ' + JSON.stringify(counters) + '\n' +
      'Eksisterende vine: ' + JSON.stringify(wines) + '\n' +
      'Brugerens tekst: "' + text + '"\n\n' +
      'Returnér {"actions":[...]}. Hver handling er én af:\n' +
      '{"kind":"counter","counter":"<tæller-navn>","sub":"<underkategori eller tom streng>","delta":<heltal>}\n' +
      '{"kind":"wine","wine":"<vinnavn>","measure":"glasses"|"bottles","delta":<heltal>,"producer":"","country":"","region":"","grape":""}\n\n' +
      'VIGTIGT: Nævner brugeren en bestemt type/sort/variant af det der tælles, SKAL den i feltet "sub". Brug stavemåden fra "muligeTyper" hvis typen står der.\n' +
      'Match KUN til en eksisterende tæller hvis OBJEKTET/PRODUKTET passer til tællerens emne. Verbets lighed er IKKE nok — "snittet 500 dumle" må IKKE matche "Løg snittet". delta kan være negativt.\n' +
      'Er objektet nyt, returner det ALLIGEVEL som en counter-handling med et kortfattet dansk navn. Returnér kun {"actions":[]} for rent ikke-trackbare sætninger.';

    const out = await callClaude({
      model: PARSE_MODEL,
      system: "Du omsætter en brugers fritekst-log til strukturerede handlinger for en restaurant-tracker. Svar KUN med gyldig JSON, ingen markdown.",
      content,
    });
    const p = extractJSON(out);
    const actions = Array.isArray(p) ? p : (p && Array.isArray(p.actions)) ? p.actions : (p && p.kind) ? [p] : [];
    res.json({ actions });
  } catch (err) {
    console.error("parse-log:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---- Vin-opslag ----
app.post("/api/wine-search", async (req, res) => {
  try {
    const { query } = req.body || {};
    if (!query || String(query).trim().length < 2) return res.json({ wines: [] });
    const out = await callClaude({
      model: WINE_MODEL,
      system: "Du er en vindatabase. Svar KUN med gyldig JSON. Ingen markdown.",
      content: 'Find op til 7 virkelige vine der matcher "' + query + '". Returnér JSON-array med name, producer, country (dansk), region, grape. Tomme strenge hvis ukendt. Kun ægte vine.',
    });
    const p = extractJSON(out);
    res.json({ wines: Array.isArray(p) ? p : (p && Array.isArray(p.wines)) ? p.wines : [] });
  } catch (err) {
    console.error("wine-search:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Craft Track backend kører på port " + PORT));
