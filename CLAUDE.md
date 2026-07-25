# CLAUDE.md — Craft Tracker

Projektbriefing til Claude Code. Læs denne før du ændrer noget.

## Hvad er projektet
Craft Tracker er en tracker for restaurationsfolk (kokke, tjenere, bartendere,
baristaer). Kernen er en **vagt-tracker**: man tæller sit håndværk gennem en vagt
(østers åbnet, løg snittet, cocktails lavet, couverter serveret …) via en
**naturlig-sprog-log** — brugeren skriver fx "snittet 500 rødløg", og appen finder
den rigtige tæller, opretter underkategorien hvis den mangler, og lægger 500 på.

Oveni: vin-styring, socialt feed, ranglister, hold, achievements og "The Lab"
(opskriftsudvikling). UI er på **dansk** (med engelsk toggle).

Repo: https://github.com/playerdam/Tracker
Deploy: **Railway** (auto-deploy ved `git push`) + native **iOS via Capacitor** (App Store).

## Stak og struktur
```
server.js          # Node/Express. Serverer app/ OG proxyer Claude OG taler med Supabase.
                   # deps: express, cors, web-push. Node 18+. start = node server.js
app/mise.html      # HTML-skelettet (alle views + modaler)
app/app.js         # AL klient-logik i én stor IIFE (vanilla JS, ingen framework)
app/styles.css     # al styling
app/sw.js          # service worker (cache — CACHE-versionen bumpes ved hver klient-ændring)
supabase/          # SETUP.sql (skema, single source of truth), VERIFY.sql, METRICS.sql
mobile/            # Capacitor iOS-wrapper. mobile/scripts/build.js kopierer app/ → mobile/www
test/              # Playwright smoke-test + stub-server
.env.example       # ANTHROPIC_API_KEY m.m. (.env committes ALDRIG)
```
- Ingen build-step for web-appen — vanilla JS, bevidst uden React.
- API-nøgler lever KUN på serveren. Klienten finder backend via `apiBase()`
  (samme origin på web; hardkodet Railway-URL i mobil-buildet).

## Data og auth (server-side)
- **Supabase** (Postgres + Auth). Serveren bruger `service_role` og bypasser RLS;
  RLS er slået til som defense-in-depth (klienten rører aldrig Supabase-data direkte,
  kun `/auth/v1/` til login).
- Auth: Supabase Auth (email/password + Google/Apple OAuth). **Bearer-tokens** — hvert
  data-endpoint kalder `verifyAuth(req)`.
- Klient-state (tællere, vine, vagthistorik) ligger i `localStorage` (`mise_state_v2`)
  OG synkes til serveren (`user_state`-tabellen) via `/api/state` med per-element merge,
  så flere enheder ikke overskriver hinanden.
- Skemaet vedligeholdes i **`supabase/SETUP.sql`** (kør `VERIFY.sql` for at tjekke det).

## AI-funktioner (alle via backenden, model: `claude-haiku-4-5-20251001`)
parse-log, wine-search, stats-query, lab/analyze (vision), visits/wine-from-label +
wine-lineup (vision), lab/dishes/ai, lab/dishes/description, shift/summary,
gen-category-icon, translate-label, notes-summary.
- **Sikkerheds-konvention (følg den):** alle AI-endpoints har rate-limit + system-prompt
  der behandler brugerinput som DATA, ikke instruktioner (anti-injection). De to åbne
  Q&A-endpoints (stats-query, lab/dishes/ai) afviser hårdt spørgsmål uden for emnet.
- `parse-log` har en **lokal fallback** (`localParse`) så hurtig-log aldrig står død.

## Navigation (IA)
- **Bund-nav = trackeren (det personlige):** Overblik · Historik · ➕(log) · Stats · Profil.
- **Burger-menu = app-features:** Vin · Rangliste · Feed · Lab.
- Profil samler konto, hold, følge-anmodninger (rød prik-notifikation) og indstillinger
  (mørkt tema + sprog).

## Konventioner (følg dem)
- Al UI-tekst på **dansk** (engelsk via toggle — hold begge ved lige i `translateUI()`).
- **Hver DOM-opslag i `translateUI()` (og IIFE-kaldte funktioner) SKAL null-guardes** —
  et uguarderet opslag der crasher dræber hele appen ved boot.
- **ALDRIG +1-tap-logging eller numtray-popup på dashboard/ringe/tiles.** Dashboard åbner
  overblik; logning sker via tekstfelt/quick-log. (Stærk bruger-regel.)
- Design: lyst som standard + manuel mørk tilstand, Inter + Fraunces (tal/wordmark),
  burgundy accent `--accent:#8A2E3F`. Enkelt og læsbart.
- API-nøgler aldrig i klienten eller repoet.

## Arbejdsgang efter en ændring
1. `git push origin main` (Railway auto-deployer).
2. Klient-ændring? Bump `CACHE`-versionen i `app/sw.js`.
3. Mobil: `cd mobile && npm run build && npx cap sync ios`.
4. `npm test` (Playwright smoke) skal være grøn.
