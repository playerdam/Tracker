// Craft Track backend
// Endpoints: GET /api/config  POST /api/parse-log  POST /api/wine-search
//            POST /api/user/profile  POST /api/user/update
//            POST /api/log-entry     GET /api/health

const express = require("express");
const cors    = require("cors");
const path    = require("path");

const app = express();
app.use(cors());
app.use(express.json({ limit: "256kb" }));

const API_KEY          = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL     = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_KEY     = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_ANON    = process.env.SUPABASE_ANON_KEY || "";
const PARSE_MODEL      = process.env.PARSE_MODEL || "claude-haiku-4-5-20251001";
const WINE_MODEL       = process.env.WINE_MODEL  || "claude-haiku-4-5-20251001";

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

// ---- Supabase data REST ----
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

// ---- Auth token verification ----
// Calls Supabase /auth/v1/user to validate the Bearer token and return the user UUID.
async function verifyAuth(req) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) throw new Error("Ikke autoriseret");
  const token = auth.slice(7);
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Ugyldig token");
  const data = await res.json();
  if (!data.id) throw new Error("Ukendt bruger");
  return data.id;
}

// ---- Statiske filer ----
app.use(express.static(path.join(__dirname, "app")));
app.get("/", (_req, res) => res.sendFile(path.join(__dirname, "app", "mise.html")));
app.get("/api/health", (_req, res) => res.json({ ok: true, service: "craft-track" }));

// Eksponér public config (ikke secrets) til frontend
app.get("/api/config", (_req, res) => {
  res.json({ supabaseUrl: SUPABASE_URL, anonKey: SUPABASE_ANON });
});

// ---- Brugerprofil: opret (upsert) eller hent ----
app.post("/api/user/profile", async (req, res) => {
  try {
    const userId = await verifyAuth(req);
    await sb("users", {
      method: "POST",
      body: JSON.stringify({ id: userId }),
      headers: { "Prefer": "resolution=ignore-duplicates,return=representation" },
    });
    res.json({ ok: true });
  } catch (err) {
    console.error("user/profile:", err.message);
    res.status(err.message === "Ikke autoriseret" || err.message === "Ugyldig token" ? 401 : 500).json({ error: err.message });
  }
});

// ---- Brugerprofil: opdatér kaldenavn/profession ----
app.post("/api/user/update", async (req, res) => {
  try {
    const userId = await verifyAuth(req);
    const { nickname, profession } = req.body || {};
    await sb(`users?id=eq.${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ nickname: nickname || null, profession: profession || null }),
    });
    res.json({ ok: true });
  } catch (err) {
    console.error("user/update:", err.message);
    res.status(err.message === "Ikke autoriseret" || err.message === "Ugyldig token" ? 401 : 500).json({ error: err.message });
  }
});

// ---- Log-indgang ----
app.post("/api/log-entry", async (req, res) => {
  try {
    const userId = await verifyAuth(req);
    const { categoryLabel } = req.body || {};
    let { delta } = req.body || {};
    delta = parseInt(delta, 10);
    if (!categoryLabel || !delta) return res.status(400).json({ error: "Felter mangler" });

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
    res.status(err.message === "Ikke autoriseret" || err.message === "Ugyldig token" ? 401 : 500).json({ error: err.message });
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
