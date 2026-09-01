---
name: release-ios
description: Fører en ændring i Craft Tracker ud til brugerne. Ét push til main deployer backenden på Railway OG udløser Xcode Cloud, der selv bygger og uploader iOS-appen. Indeholder rækkefølgen backend før klient, hvorfor man aldrig bygger manuelt oveni, hvordan build-numre faktisk tildeles, og tjek før push.
when_to_use: En ændring skal udgives, der skal laves et TestFlight-build, appen skal til App Store review, eller brugeren siger "push", "release" eller "udgiv".
disable-model-invocation: true
allowed-tools:
  - Read
  - Bash(npm test)
  - Bash(git status:*)
  - Bash(git log:*)
  - Bash(git diff:*)
---

# Udgivelse

**Ét push til main udgiver alting.** Railway deployer backenden på sekunder, og
Xcode Cloud bygger og uploader iOS-appen automatisk. Der er ingen manuelle trin.

| | Udløses af | Hvor hurtigt ude |
|---|---|---|
| **Backend** (`server.js`) | push til main → Railway | sekunder |
| **Webklient** (`app/`) | samme push + service worker-cache | næste indlæsning |
| **iOS-klient** | samme push → Xcode Cloud bygger + uploader | build på minutter, review på dage |

## 1. De to regler der koster mest at bryde

**Push kun når brugeren siger "push".** Commit frit lokalt imens. Hvert push er
ét build og ét upload, og for mange uploads samme dag rammer Apples daglige
upload-grænse — fejlkode **90382**, som viser sig som "Preparing build for App
Store Connect failed". Derfor: saml ændringer i ét push i stedet for tre.

**Byg aldrig manuelt oveni.** Kør ikke `npm run ios:release`, og arkivér ikke i
Xcode efter et push. Xcode Cloud har allerede bygget og uploadet; en manuel
arkivering er endnu et upload mod den samme grænse.

## 2. Build-numre tildeles ikke i repoet

Xcode Cloud tæller sine egne build-numre. **Det nummer der står i App Store
Connect, er ikke `CURRENT_PROJECT_VERSION` i `project.pbxproj`** — de to følges
ikke ad og skal ikke bringes i overensstemmelse.

`mobile/scripts/bump-build.js` og `npm run ios:release` hører til en manuel
arkivering fra Xcode. På den vej, appen udgives ad i dag, er de uden virkning
og skal ikke køres.

## 3. Rækkefølgen

Backend først, klient bagefter. Da begge dele udløses af det samme push, sker det
af sig selv — men det betyder at **API-ændringen skal være bagudkompatibel før du
pusher**. Klienten i buildet rammer den nye backend med det samme, og de gamle
klienter ude hos brugerne gør det også. Se `bagudkompatibilitet`.

## 4. Før push

```
Klar til push:
- [ ] npm test grøn
- [ ] sw.js CACHE bumpet ved enhver ændring i app/
- [ ] API-ændringer er additive — gamle klienter overlever
- [ ] Ændringen afprøvet i simulator, hvis den rører klienten (se afsnit 5)
- [ ] Ingen nøgler, ingen dev-URL, ingen test-data i klienten
- [ ] Alt der skal med, er committet — ét push, ikke tre
```

## 5. Lokalt build er til afprøvning, ikke til udgivelse

```bash
cd mobile && npm run sync     # bygger app/ → www og synker til Xcode-projektet
```

Det er den legitime brug af mobil-scriptsene: se ændringen køre i simulator eller
på en enhed, før den pushes. Den tæller ikke build-numre op og uploader ingenting.

`mobile/www` er build-output og ligger uden for git — den kan derfor være måneder
gammel uden at noget siger fra. Bekræft at den matcher `app/` frem for at antage det.

## 6. Efter push

- Følg buildet i App Store Connect. Apple behandler det, før det kan bruges i
  TestFlight; et build der ikke dukker op med det samme, er ikke nødvendigvis fejlet.
- En mail om et problem med buildet handler oftest om manglende privatlivserklæring
  eller en manglende rettighedsbeskrivelse — ikke om koden.
- **Afvist i review?** Læs præcis hvilken retningslinje der henvises til, ret kun
  det, og svar i Resolution Center. En app med konti skal kunne slette kontoen inde
  i appen, og alt der ligner betaling skal gå gennem Apples egen betaling.
- Udgivelsen er slut, når du har set en rigtig installation køre den nye version —
  ikke ved upload.
