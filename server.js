// MISE backend — holder din API-nøgle sikkert på serveren og taler med Claude.
// Kør lokalt:  npm install && npm start
// Endpoints:   POST /api/parse-log   POST /api/wine-search   GET /

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// CORS: åben i udvikling. I produktion bør du låse den til din app's origin,
// fx: app.use(cors({ origin: "https://din-app.example" }))
app.use(cors());
app.use(express.json({ limit: "256kb" }));

const API_KEY = process.env.ANTHROPIC_API_KEY;
const PARSE_MODEL = process.env.PARSE_MODEL || "claude-haiku-4-5-20251001";
const WINE_MODEL  = process.env.WINE_MODEL  || "claude-haiku-4-5-20251001";

// --- kald Claude (REST, ingen SDK nødvendig — kræver Node 18+ for global fetch) ---
async function callClaude({ model, system, content, maxTokens = 1000 }) {
  if (!API_KEY) throw new Error("ANTHROPIC_API_KEY mangler i miljøet");
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content }],
    }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error((data && data.error && data.error.message) || ("HTTP " + r.status));
  return (data.content || []).filter(b => b.type === "text").map(b => b.text).join("").trim();
}

// --- robust JSON-udtræk fra modellens svar ---
function extractJSON(text) {
  const clean = (text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
  try { return JSON.parse(clean); }
  catch (_) {
    const m = clean.match(/[\[{][\s\S]*[\]}]/);
    if (m) { try { return JSON.parse(m[0]); } catch (__) {} }
  }
  return null;
}

// Servér selve appen (app/mise.html) så Railway-URL'en viser appen
app.use(express.static(path.join(__dirname, "app")));
app.get("/", (_req, res) => res.sendFile(path.join(__dirname, "app", "mise.html")));
app.get("/api/health", (_req, res) => res.json({ ok: true, service: "mise-backend" }));

// --- fritekst -> handlinger ---
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
      'VIGTIGT: Nævner brugeren en bestemt type/sort/variant af det der tælles, SKAL den i feltet "sub" — også hvis den ikke findes endnu. Tælleren er den generelle handling. Brug stavemåden fra "muligeTyper" hvis typen står der.\n' +
      'Eksempler:\n' +
      '"snittet 500 rødløg" -> {"actions":[{"kind":"counter","counter":"Løg snittet","sub":"Rødløg","delta":500}]}\n' +
      '"åbnet 500 Gillardeau østers" -> {"actions":[{"kind":"counter","counter":"Østers åbnet","sub":"Gillardeau","delta":500}]}\n' +
      '"drukket 3 glas Tignanello" -> {"actions":[{"kind":"wine","wine":"Tignanello","measure":"glasses","delta":3,"producer":"","country":"","region":"","grape":""}]}\n\n' +
      'Match eksisterende tæller/vin når det passer, og brug den eksisterende stavemåde. delta kan være negativt.\n' +
      'Nævner brugeren en aktivitet eller et produkt der IKKE matcher nogen eksisterende tæller, returner den ALLIGEVEL som en counter-handling med et kortfattet dansk navn (fx "Artisjokker skåret" eller "Beurre blanc"). Returnér kun {"actions":[]} for rent ikke-trackbare sætninger (spørgsmål, snak etc.).';

    const out = await callClaude({
      model: PARSE_MODEL,
      system: "Du omsætter en brugers fritekst-log til strukturerede handlinger for en restaurant-tracker. Svar KUN med gyldig JSON, ingen markdown, ingen forklaring.",
      content,
    });
    const p = extractJSON(out);
    const actions = Array.isArray(p) ? p
      : (p && Array.isArray(p.actions)) ? p.actions
      : (p && p.kind) ? [p]
      : [];
    res.json({ actions });
  } catch (err) {
    console.error("parse-log:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- vin-opslag ---
app.post("/api/wine-search", async (req, res) => {
  try {
    const { query } = req.body || {};
    if (!query || String(query).trim().length < 2) return res.json({ wines: [] });

    const out = await callClaude({
      model: WINE_MODEL,
      system: "Du er en vindatabase. Svar KUN med gyldig JSON. Ingen markdown, ingen forklaring.",
      content:
        'Find op til 7 virkelige, eksisterende vine der matcher søgningen "' + query + '". ' +
        'Returnér et JSON-array. Hvert element: name, producer, country (land på dansk), region, grape. ' +
        'Brug tomme strenge hvis ukendt. Kun ægte vine. Matcher intet -> []. Kun JSON.',
    });
    const p = extractJSON(out);
    const wines = Array.isArray(p) ? p : (p && Array.isArray(p.wines)) ? p.wines : [];
    res.json({ wines });
  } catch (err) {
    console.error("wine-search:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("MISE backend kører på port " + PORT));
