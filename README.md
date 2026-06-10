# Tracker (MISE)

Restaurant-tracker med naturlig-sprog-logning drevet af Claude.
Serveren serverer **både appen og API'et**, så din Railway-URL er ét link du kan dele.

## Struktur

```
.
├── server.js          # serverer appen + API (Railway kører denne)
├── package.json
├── .env.example
├── .gitignore
└── app/
    └── mise.html      # selve appen (serveres på rod-URL'en)
```

## Deploy på Railway

1. Push dette repo til GitHub.
2. Railway → **New Project** → **Deploy from GitHub repo** → vælg repoet.
   Den finder `package.json` i roden og kører `npm start` selv.
   (Hvis du tidligere satte **Root Directory** til `mise-backend`, så fjern den.)
3. **Variables** → tilføj `ANTHROPIC_API_KEY`.
4. **Settings → Networking → Generate Domain**.

Åbn nu URL'en — den viser **appen** (ikke længere JSON). Sundhedstjek ligger på `/api/health`.
Det link kan du sende til folk, der så kan teste i deres egen browser.

Appen finder selv sin backend, fordi den serveres fra samme server — du behøver ikke
sætte nogen URL i koden.

## Kør lokalt

```bash
npm install
export ANTHROPIC_API_KEY=sk-ant-...
npm start                       # http://localhost:3000 viser appen
```
