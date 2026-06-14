// Craft Tracker backend
// Endpoints: GET /api/config  POST /api/parse-log  POST /api/wine-search
//            POST /api/user/profile  POST /api/user/update
//            GET  /api/users/check-username
//            POST /api/log-entry     POST /api/upload-photo
//            GET  /api/leaderboard   GET  /api/challenge/current
//            POST /api/teams         POST /api/teams/join   GET /api/teams/mine
//            GET  /api/feed          POST /api/follow        DELETE /api/follow/:targetId
//            GET  /api/follow/requests  POST /api/follow/:followerId/accept  DELETE /api/follow/:followerId/reject
//            POST /api/like/:id      DELETE /api/like/:id
//            GET  /api/comments/:id  POST /api/comments/:id
//            GET  /api/users/search  POST /api/gen-category-icon
//            GET  /api/health

const express = require("express");
const cors    = require("cors");
const path    = require("path");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const API_KEY       = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL  = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY || "";
const PARSE_MODEL   = process.env.PARSE_MODEL || "claude-haiku-4-5-20251001";
const WINE_MODEL    = process.env.WINE_MODEL  || "claude-sonnet-4-6";

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

// ---- Supabase Storage ----
async function uploadToStorage(bucket, objectPath, buffer, contentType) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${objectPath}`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: buffer,
  });
  if (!res.ok) throw new Error(`Storage upload fejlede: ${res.status}`);
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${objectPath}`;
}

// ---- Auth token verification ----
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

function authErr(msg) {
  return msg === "Ikke autoriseret" || msg === "Ugyldig token";
}

// ---- Hjælpefunktioner ----
function genCode(len = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < len; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function mondayOfWeek() {
  const now = new Date();
  const dow = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// ---- Statiske filer ----
app.use(express.static(path.join(__dirname, "app")));
app.get("/", (_req, res) => res.sendFile(path.join(__dirname, "app", "mise.html")));
app.get("/api/health", (_req, res) => res.json({ ok: true, service: "craft-track" }));

app.get("/api/config", (_req, res) => {
  res.json({ supabaseUrl: SUPABASE_URL, anonKey: SUPABASE_ANON });
});

// ---- Brugerprofil: opret (upsert) + hent ----
app.post("/api/user/profile", async (req, res) => {
  try {
    const userId = await verifyAuth(req);
    await sb("users", {
      method: "POST",
      body: JSON.stringify({ id: userId }),
      headers: { "Prefer": "resolution=ignore-duplicates,return=representation" },
    });
    const rows = await sb(`users?id=eq.${userId}&select=nickname,profession,username`);
    const u = (rows || [])[0] || {};
    res.json({ ok: true, nickname: u.nickname || null, profession: u.profession || null, username: u.username || null });
  } catch (err) {
    console.error("user/profile:", err.message);
    res.status(authErr(err.message) ? 401 : 500).json({ error: err.message });
  }
});

// ---- Brugerprofil: opdatér ----
app.post("/api/user/update", async (req, res) => {
  try {
    const userId = await verifyAuth(req);
    const { nickname, profession, username } = req.body || {};
    const patch = { nickname: nickname || null, profession: profession || null };
    if (username !== undefined) {
      const u = (username || "").trim().toLowerCase();
      if (u && !/^[a-z0-9_]{3,30}$/.test(u)) return res.status(400).json({ error: "invalid_username" });
      if (u) {
        const taken = await sb(`users?username=eq.${encodeURIComponent(u)}&select=id`);
        if ((taken || []).some(r => r.id !== userId)) return res.status(409).json({ error: "username_taken" });
      }
      patch.username = u || null;
    }
    await sb(`users?id=eq.${userId}`, { method: "PATCH", body: JSON.stringify(patch) });
    res.json({ ok: true });
  } catch (err) {
    console.error("user/update:", err.message);
    res.status(authErr(err.message) ? 401 : 500).json({ error: err.message });
  }
});

// ---- Tjek brugernavn-tilgængelighed ----
app.get("/api/users/check-username", async (req, res) => {
  try {
    const userId = await verifyAuth(req);
    const u = (req.query.username || "").trim().toLowerCase();
    if (!u || !/^[a-z0-9_]{3,30}$/.test(u)) return res.json({ available: false, error: "invalid" });
    const rows = await sb(`users?username=eq.${encodeURIComponent(u)}&select=id`) || [];
    res.json({ available: !rows.some(r => r.id !== userId) });
  } catch (err) {
    res.status(authErr(err.message) ? 401 : 500).json({ error: err.message });
  }
});

// ---- Log-indgang ----
app.post("/api/log-entry", async (req, res) => {
  try {
    const userId = await verifyAuth(req);
    const { categoryLabel, imageUrl, summary } = req.body || {};
    let { delta } = req.body || {};
    delta = parseInt(delta, 10);
    if (!categoryLabel || !delta) return res.status(400).json({ error: "Felter mangler" });

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

    const row = { user_id: userId, category_id: categoryId, delta, is_public: true };
    if (imageUrl) row.image_url = imageUrl;
    if (summary) row.summary = summary.slice(0, 200);
    await sb("log_entries", { method: "POST", body: JSON.stringify(row) });
    res.json({ ok: true });
  } catch (err) {
    console.error("log-entry:", err.message);
    res.status(authErr(err.message) ? 401 : 500).json({ error: err.message });
  }
});

// ---- Foto-upload ----
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MAX_PHOTO_BYTES = 20 * 1024 * 1024; // 20 MB raw file; after resize the base64 will be much smaller

app.post("/api/upload-photo", async (req, res) => {
  try {
    const userId = await verifyAuth(req);
    const { dataUrl } = req.body || {};
    if (!dataUrl) return res.status(400).json({ error: "Ingen billeddata" });

    // Parse data URL: "data:<mime>;base64,<data>"
    const match = dataUrl.match(/^data:([a-zA-Z0-9+/.-]+);base64,(.+)$/);
    if (!match) return res.status(400).json({ error: "Ugyldigt format" });
    const [, contentType, b64] = match;

    if (!ALLOWED_PHOTO_TYPES.includes(contentType)) {
      return res.status(400).json({ error: "Filtype ikke tilladt" });
    }

    const buffer = Buffer.from(b64, "base64");
    if (buffer.length > MAX_PHOTO_BYTES) {
      return res.status(413).json({ error: "Billedet er for stort (maks 20 MB)" });
    }

    const extMap = { "image/png": "png", "image/webp": "webp", "image/heic": "heic", "image/heif": "heif" };
    const ext = extMap[contentType] || "jpg";
    const url = await uploadToStorage("log-photos", `${userId}/${Date.now()}.${ext}`, buffer, contentType);
    res.json({ url });
  } catch (err) {
    console.error("upload-photo:", err.message);
    res.status(authErr(err.message) ? 401 : 500).json({ error: err.message });
  }
});

// ---- Ugentlig rangliste ----
app.get("/api/leaderboard", async (req, res) => {
  try {
    const monday = mondayOfWeek();
    const rows = await sb(`log_entries?logged_at=gte.${monday.toISOString()}&select=user_id,delta,users(nickname,profession)`) || [];
    const agg = {};
    for (const r of rows) {
      if (!agg[r.user_id]) agg[r.user_id] = { userId: r.user_id, total: 0, nickname: r.users?.nickname || null, profession: r.users?.profession || null };
      if (r.delta > 0) agg[r.user_id].total += r.delta;
    }
    const leaderboard = Object.values(agg).sort((a, b) => b.total - a.total).slice(0, 25);
    res.json({ leaderboard, weekStart: monday.toISOString() });
  } catch (err) {
    console.error("leaderboard:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---- Ugens udfordring ----
app.get("/api/challenge/current", async (req, res) => {
  try {
    const CATS = ["Oysters opened", "Onions cut", "Bottles opened", "Covers served"];
    const CATS_DA = ["Østers åbnet", "Løg snittet", "Flasker åbnet", "Couverter serveret"];
    const weekNum = Math.floor(Date.now() / (7 * 24 * 3600 * 1000));
    const idx = weekNum % CATS_DA.length;
    const categoryDa = CATS_DA[idx];
    const categoryEn = CATS[idx];

    const monday = mondayOfWeek();
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const cats = await sb(`categories?label_da=eq.${encodeURIComponent(categoryDa)}&select=id`);
    if (!cats?.length) return res.json({ categoryDa, categoryEn, leaderboard: [], weekStart: monday.toISOString(), weekEnd: sunday.toISOString() });

    const rows = await sb(`log_entries?category_id=eq.${cats[0].id}&logged_at=gte.${monday.toISOString()}&select=user_id,delta,users(nickname,profession)`) || [];
    const agg = {};
    for (const r of rows) {
      if (!agg[r.user_id]) agg[r.user_id] = { userId: r.user_id, total: 0, nickname: r.users?.nickname || null, profession: r.users?.profession || null };
      if (r.delta > 0) agg[r.user_id].total += r.delta;
    }
    const leaderboard = Object.values(agg).sort((a, b) => b.total - a.total).slice(0, 25);
    res.json({ categoryDa, categoryEn, leaderboard, weekStart: monday.toISOString(), weekEnd: sunday.toISOString() });
  } catch (err) {
    console.error("challenge:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---- Hold: opret ----
app.post("/api/teams", async (req, res) => {
  try {
    const userId = await verifyAuth(req);
    const { name } = req.body || {};
    if (!name?.trim()) return res.status(400).json({ error: "Holdnavn mangler" });
    const teams = await sb("teams", {
      method: "POST",
      body: JSON.stringify({ name: name.trim(), invite_code: genCode(6), created_by: userId }),
    });
    const team = teams[0];
    await sb("team_members", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, team_id: team.id }),
      headers: { "Prefer": "resolution=ignore-duplicates,return=representation" },
    });
    res.json({ id: team.id, name: team.name, invite_code: team.invite_code });
  } catch (err) {
    console.error("teams/create:", err.message);
    res.status(authErr(err.message) ? 401 : 500).json({ error: err.message });
  }
});

// ---- Hold: tilslut ----
app.post("/api/teams/join", async (req, res) => {
  try {
    const userId = await verifyAuth(req);
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ error: "Kode mangler" });
    const teams = await sb(`teams?invite_code=eq.${encodeURIComponent(code.trim().toUpperCase())}`);
    if (!teams?.length) return res.status(404).json({ error: "not_found" });
    const team = teams[0];
    await sb("team_members", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, team_id: team.id }),
      headers: { "Prefer": "resolution=ignore-duplicates,return=representation" },
    });
    res.json({ id: team.id, name: team.name, invite_code: team.invite_code });
  } catch (err) {
    console.error("teams/join:", err.message);
    res.status(authErr(err.message) ? 401 : 500).json({ error: err.message });
  }
});

// ---- Hold: hent mit hold + ugens stats ----
app.get("/api/teams/mine", async (req, res) => {
  try {
    const userId = await verifyAuth(req);
    const memberships = await sb(`team_members?user_id=eq.${userId}&select=team_id,teams(id,name,invite_code)`);
    if (!memberships?.length) return res.json({ team: null });
    const team = memberships[0].teams;
    const members = await sb(`team_members?team_id=eq.${team.id}&select=user_id,users(nickname,profession)`) || [];
    const memberIds = members.map(m => m.user_id);

    const monday = mondayOfWeek();
    let entries = [];
    if (memberIds.length) {
      entries = await sb(`log_entries?logged_at=gte.${monday.toISOString()}&user_id=in.(${memberIds.join(",")})&select=user_id,delta`) || [];
    }
    const stats = {};
    for (const m of members) {
      stats[m.user_id] = { userId: m.user_id, nickname: m.users?.nickname || null, profession: m.users?.profession || null, total: 0 };
    }
    for (const e of entries) {
      if (stats[e.user_id] && e.delta > 0) stats[e.user_id].total += e.delta;
    }
    res.json({
      team: { id: team.id, name: team.name, invite_code: team.invite_code },
      members: Object.values(stats).sort((a, b) => b.total - a.total),
    });
  } catch (err) {
    console.error("teams/mine:", err.message);
    res.status(authErr(err.message) ? 401 : 500).json({ error: err.message });
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
      content: 'Find op til 7 virkelige vine der matcher "' + query + '". Returnér JSON-array med felterne: name, producer, country (på dansk), region, grape. Brug kun faktuel viden — returner tom streng for grape hvis du er usikker frem for at gætte. Kun ægte vine.',
    });
    const p = extractJSON(out);
    res.json({ wines: Array.isArray(p) ? p : (p && Array.isArray(p.wines)) ? p.wines : [] });
  } catch (err) {
    console.error("wine-search:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---- Kategori-ikon generering ----
app.post("/api/gen-category-icon", async (req, res) => {
  try {
    await verifyAuth(req);
    const { name } = req.body || {};
    if (!name || typeof name !== "string" || name.trim().length < 1 || name.length > 60)
      return res.status(400).json({ error: "invalid" });
    const n = name.trim();
    const out = await callClaude({
      model: WINE_MODEL,
      maxTokens: 1200,
      system: "Du genererer SVG-ikoner til en restaurant-app. Svar KUN med rå SVG på én linje. Ingen markdown, ingen forklaring.",
      content: `Lav et minimalt SVG-illustration-ikon for en køkkenkategori kaldet "${n}".

REGLER:
- Rod-element: <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
- Farver: KUN fill="currentColor", fill="none", stroke="currentColor", fill="var(--surface)". ALDRIG hex-farver eller rgb().
- Vis 2-3 genkendelige køkken/mad-objekter der repræsenterer "${n}"
- Streger: outlines 2-2.5px, detaljer 1.2-1.8px. Objekter centreret i 64x64 canvas.
- Returner KUN SVG på én linje, ingen markdown

EKSEMPEL (Tilberedt - gryde med damp):
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14 C20 10 22 8 20 4" stroke-width="1.8"/><path d="M32 12 C32 8 34 6 32 2" stroke-width="1.8"/><path d="M44 14 C44 10 46 8 44 4" stroke-width="1.8"/><rect x="28" y="16" width="8" height="6" rx="3" fill="currentColor" stroke="none"/><path d="M16 28 C16 24 20 22 22 22 L42 22 C44 22 48 24 48 28" stroke-width="2.5"/><line x1="14" y1="28" x2="50" y2="28" stroke-width="2.5"/><path d="M14 28 L14 54 Q14 62 20 62 L44 62 Q50 62 50 54 L50 28"/><path d="M14 36 C10 36 8 38 8 42 C8 46 10 48 14 48" stroke-width="2"/><path d="M50 36 C54 36 56 38 56 42 C56 46 54 48 50 48" stroke-width="2"/></svg>

EKSEMPEL (Serveret - fadfad med kuppel):
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="32" cy="56" rx="26" ry="6" stroke-width="2.5"/><path d="M8 56 C8 36 16 20 32 18 C48 20 56 36 56 56" stroke-width="2.5"/><path d="M14 46 C16 34 22 26 32 24 C42 26 48 34 50 46" stroke-width="1.2"/><circle cx="32" cy="10" r="5" fill="currentColor" stroke="none"/><line x1="32" y1="15" x2="32" y2="20" stroke-width="2.5"/></svg>`,
    });
    const svg = out.trim().replace(/^```[\w]*\n?/,"").replace(/\n?```$/,"").trim();
    if (!svg.startsWith("<svg") || !svg.endsWith(">"))
      return res.status(422).json({ error: "invalid_svg" });
    if (/#[0-9a-fA-F]{3}/.test(svg) || /rgb\(/.test(svg) || /hsl\(/.test(svg))
      return res.status(422).json({ error: "hardcoded_color" });
    res.json({ svg });
  } catch (err) {
    console.error("gen-category-icon:", err.message);
    res.status(authErr(err.message) ? 401 : 500).json({ error: err.message });
  }
});

// ---- Social: bruger-søgning ----
app.get("/api/users/search", async (req, res) => {
  try {
    const userId = await verifyAuth(req);
    const q = (req.query.q || "").trim();
    if (!q || q.length < 2) return res.json({ users: [] });
    const qEnc = encodeURIComponent(q);
    const rows = await sb(`users?or=(username.ilike.*${qEnc}*,nickname.ilike.*${qEnc}*)&select=id,nickname,profession,username&limit=20`) || [];
    const followRows = await sb(`follows?follower_id=eq.${userId}&select=following_id,status`) || [];
    const followMap = {};
    followRows.forEach(r => { followMap[r.following_id] = r.status; });
    const users = rows
      .filter(r => r.id !== userId)
      .map(r => ({ id: r.id, nickname: r.nickname, profession: r.profession, username: r.username, followStatus: followMap[r.id] || "none" }));
    res.json({ users });
  } catch (err) {
    res.status(authErr(err.message) ? 401 : 500).json({ error: err.message });
  }
});

// ---- Social: send følge-anmodning ----
app.post("/api/follow", async (req, res) => {
  try {
    const userId = await verifyAuth(req);
    const { targetId } = req.body || {};
    if (!targetId || targetId === userId) return res.status(400).json({ error: "Ugyldigt" });
    await sb("follows", { method: "POST", body: JSON.stringify({ follower_id: userId, following_id: targetId, status: "pending" }) });
    res.json({ ok: true, status: "pending" });
  } catch (err) {
    if (err.message && err.message.includes("duplicate")) return res.json({ ok: true, status: "pending" });
    res.status(authErr(err.message) ? 401 : 500).json({ error: err.message });
  }
});

// ---- Social: annuller/unfollow ----
app.delete("/api/follow/:targetId", async (req, res) => {
  try {
    const userId = await verifyAuth(req);
    const { targetId } = req.params;
    await sb(`follows?follower_id=eq.${userId}&following_id=eq.${targetId}`, { method: "DELETE" });
    res.json({ ok: true });
  } catch (err) {
    res.status(authErr(err.message) ? 401 : 500).json({ error: err.message });
  }
});

// ---- Social: modtagne følge-anmodninger ----
app.get("/api/follow/requests", async (req, res) => {
  try {
    const userId = await verifyAuth(req);
    const rows = await sb(`follows?following_id=eq.${userId}&status=eq.pending&select=follower_id,created_at`) || [];
    if (!rows.length) return res.json({ requests: [] });
    const ids = rows.map(r => r.follower_id);
    const users = await sb(`users?id=in.(${ids.join(",")})&select=id,nickname,username,profession`) || [];
    const umap = {};
    users.forEach(u => { umap[u.id] = u; });
    res.json({ requests: rows.map(r => ({ followerId: r.follower_id, createdAt: r.created_at, nickname: umap[r.follower_id]?.nickname || null, username: umap[r.follower_id]?.username || null, profession: umap[r.follower_id]?.profession || null })) });
  } catch (err) {
    res.status(authErr(err.message) ? 401 : 500).json({ error: err.message });
  }
});

// ---- Social: godkend følge-anmodning ----
app.post("/api/follow/:followerId/accept", async (req, res) => {
  try {
    const userId = await verifyAuth(req);
    const { followerId } = req.params;
    await sb(`follows?follower_id=eq.${followerId}&following_id=eq.${userId}&status=eq.pending`, {
      method: "PATCH",
      body: JSON.stringify({ status: "accepted" }),
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(authErr(err.message) ? 401 : 500).json({ error: err.message });
  }
});

// ---- Social: afvis følge-anmodning ----
app.delete("/api/follow/:followerId/reject", async (req, res) => {
  try {
    const userId = await verifyAuth(req);
    const { followerId } = req.params;
    await sb(`follows?follower_id=eq.${followerId}&following_id=eq.${userId}`, { method: "DELETE" });
    res.json({ ok: true });
  } catch (err) {
    res.status(authErr(err.message) ? 401 : 500).json({ error: err.message });
  }
});

// ---- Social: feed ----
app.get("/api/feed", async (req, res) => {
  try {
    const userId = await verifyAuth(req);
    const cursor = req.query.before || null;

    // find who we follow (only accepted)
    const followRows = await sb(`follows?follower_id=eq.${userId}&status=eq.accepted&select=following_id`) || [];
    const ids = followRows.map(r => r.following_id);
    ids.push(userId); // include own entries

    if (!ids.length) return res.json({ entries: [] });

    const inClause = ids.map(i => `"${i}"`).join(",");
    let path = `log_entries?user_id=in.(${ids.join(",")})&is_public=eq.true&order=logged_at.desc&limit=40&select=id,user_id,delta,summary,image_url,logged_at,categories(label_da,label_en),users(nickname,profession)`;
    if (cursor) path += `&logged_at=lt.${encodeURIComponent(cursor)}`;

    const entries = await sb(path) || [];

    // fetch like counts + whether current user liked each
    const entryIds = entries.map(e => e.id);
    let likeCounts = {}, likedByMe = new Set();
    if (entryIds.length) {
      const likeRows = await sb(`likes?entry_id=in.(${entryIds.join(",")})&select=entry_id,user_id`) || [];
      likeRows.forEach(l => {
        likeCounts[l.entry_id] = (likeCounts[l.entry_id] || 0) + 1;
        if (l.user_id === userId) likedByMe.add(l.entry_id);
      });
      const commentRows = await sb(`comments?entry_id=in.(${entryIds.join(",")})&select=entry_id`) || [];
      var commentCounts = {};
      commentRows.forEach(c => { commentCounts[c.entry_id] = (commentCounts[c.entry_id] || 0) + 1; });
    }

    const out = entries.map(e => ({
      id: e.id,
      userId: e.user_id,
      nickname: e.users?.nickname || null,
      profession: e.users?.profession || null,
      delta: e.delta,
      summary: e.summary || null,
      imageUrl: e.image_url || null,
      category: e.categories?.label_da || null,
      categoryEn: e.categories?.label_en || null,
      loggedAt: e.logged_at,
      likes: likeCounts[e.id] || 0,
      liked: likedByMe.has(e.id),
      comments: (commentCounts || {})[e.id] || 0,
      isOwn: e.user_id === userId,
    }));
    res.json({ entries: out });
  } catch (err) {
    console.error("feed:", err.message);
    res.status(authErr(err.message) ? 401 : 500).json({ error: err.message });
  }
});

// ---- Social: likes ----
app.post("/api/like/:entryId", async (req, res) => {
  try {
    const userId = await verifyAuth(req);
    const { entryId } = req.params;
    await sb("likes", { method: "POST", body: JSON.stringify({ user_id: userId, entry_id: entryId }) });
    const rows = await sb(`likes?entry_id=eq.${entryId}&select=user_id`) || [];
    res.json({ likes: rows.length });
  } catch (err) {
    if (err.message && err.message.includes("duplicate")) {
      const rows = await sb(`likes?entry_id=eq.${req.params.entryId}&select=user_id`).catch(()=>[]);
      return res.json({ likes: (rows||[]).length });
    }
    res.status(authErr(err.message) ? 401 : 500).json({ error: err.message });
  }
});

app.delete("/api/like/:entryId", async (req, res) => {
  try {
    const userId = await verifyAuth(req);
    const { entryId } = req.params;
    await sb(`likes?user_id=eq.${userId}&entry_id=eq.${entryId}`, { method: "DELETE" });
    const rows = await sb(`likes?entry_id=eq.${entryId}&select=user_id`) || [];
    res.json({ likes: rows.length });
  } catch (err) {
    res.status(authErr(err.message) ? 401 : 500).json({ error: err.message });
  }
});

// ---- Social: kommentarer ----
app.get("/api/comments/:entryId", async (req, res) => {
  try {
    await verifyAuth(req);
    const { entryId } = req.params;
    const rows = await sb(`comments?entry_id=eq.${entryId}&order=created_at.asc&select=id,text,created_at,users(nickname)`) || [];
    res.json({ comments: rows.map(c => ({ id: c.id, text: c.text, createdAt: c.created_at, nickname: c.users?.nickname || null })) });
  } catch (err) {
    res.status(authErr(err.message) ? 401 : 500).json({ error: err.message });
  }
});

app.post("/api/comments/:entryId", async (req, res) => {
  try {
    const userId = await verifyAuth(req);
    const { entryId } = req.params;
    const text = (req.body.text || "").trim().slice(0, 280);
    if (!text) return res.status(400).json({ error: "Tom kommentar" });
    await sb("comments", { method: "POST", body: JSON.stringify({ user_id: userId, entry_id: entryId, text }) });
    const rows = await sb(`comments?entry_id=eq.${entryId}&order=created_at.asc&select=id,text,created_at,users(nickname)`) || [];
    res.json({ comments: rows.map(c => ({ id: c.id, text: c.text, createdAt: c.created_at, nickname: c.users?.nickname || null })) });
  } catch (err) {
    res.status(authErr(err.message) ? 401 : 500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Craft Tracker backend kører på port " + PORT));
