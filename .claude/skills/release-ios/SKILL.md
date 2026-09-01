---
name: release-ios
description: Fører en ændring hele vejen ud til brugerne af Craft Tracker — backend til Railway først, derefter iOS-buildet gennem bump af build-nummer, Capacitor-sync, arkivering i Xcode og upload til TestFlight eller App Store. Indeholder tjek før upload, reglerne om build-numre og hvad man gør ved en afvisning fra review.
when_to_use: En ændring skal udgives, der skal laves et TestFlight-build, appen skal sendes til App Store review, eller brugeren siger "push", "release", "udgiv" eller "send til Apple".
disable-model-invocation: true
argument-hint: [testflight|appstore]
allowed-tools:
  - Read
  - Bash(npm test)
  - Bash(git status:*)
  - Bash(git log:*)
  - Bash(git diff:*)
---

# Udgivelse

To ting udgives ad to helt forskellige veje, og de må ikke forveksles:

| | Hvordan | Hvor hurtigt ude |
|---|---|---|
| **Backend** (`server.js`) | Railway auto-deployer ved `git push` | sekunder |
| **Webklient** (`app/`) | samme push + service worker-cache | næste indlæsning |
| **iOS-klient** (`mobile/`) | build → Xcode → upload → review | dage |

**Backend først, klient bagefter.** En ny klient der rammer et gammelt API er
ødelagt for alle der opdaterer hurtigt. Se `bagudkompatibilitet` for hvorfor
den rækkefølge er ufravigelig.

## 1. Vent på grønt lys

Et upload bruger et build-nummer, og et brugt build-nummer kan aldrig genbruges.
**Byg og upload derfor ikke af egen drift.** Vent til brugeren siger det.
Commit lokalt så meget du vil.

## 2. Backend og web

```bash
npm test                     # skal være grøn
grep -n "const CACHE" app/sw.js   # bumpet ved enhver ændring i app/?
git push origin main         # Railway deployer, CI kører røgtesten
```

Bekræft at backenden er oppe bagefter — `/api/health` skal svare — før du går videre
til klienten. Er den ikke det, stopper udgivelsen her.

## 3. iOS-buildet

```bash
cd mobile && npm run ios:release
```

Den kæde gør fire ting: tæller build-nummeret op, kopierer `app/` til `mobile/www`,
synkroniserer med Xcode-projektet og åbner Xcode.

**`mobile/www` er build-output og ligger uden for git.** Den kan derfor være
måneder gammel uden at noget siger fra — den er kun opdateret hvis buildet
faktisk er kørt. Bekræft at den matcher `app/` frem for at antage det.

I Xcode: vælg **Any iOS Device**, så **Product → Archive**, så
**Distribute App → TestFlight & App Store**.

## 4. Build-numre

- Hvert upload skal have et **unikt** build-nummer. Apple afviser et genbrugt.
- Nummeret må aldrig sænkes. Et brugt nummer er brugt for altid — også hvis
  buildet blev kasseret.
- `bump-build.js` tæller +1 og skriver samme værdi alle steder i Xcode-projektet.
  Kør det gennem `npm run ios:release`, ikke i hånden.
- **Build-nummer** tæller ved hvert upload. **Marketing-version** er den brugeren
  ser, og den ændres kun når du selv beslutter det.

## 5. Før upload

```
Klar til upload:
- [ ] npm test grøn
- [ ] sw.js CACHE bumpet
- [ ] Backenden er pushet OG oppe (/api/health svarer)
- [ ] mobile/www er genbygget nu — ikke gammel
- [ ] Appen afprøvet i simulator eller på enhed efter buildet
- [ ] Ingen nøgler, ingen dev-URL, ingen test-data i klienten
- [ ] Ændringer siden sidste udgivelse gennemgået (git log)
- [ ] Build-nummer talt op
```

Punkt fire og fem er dem der oftest springes over, og dem der oftest brænder
et build-nummer.

## 6. Efter upload

- Apple behandler buildet før det kan bruges i TestFlight. Det tager typisk et
  stykke tid — et build der ikke dukker op med det samme, er ikke nødvendigvis fejlet.
- Kommer der en mail om et problem med buildet, er det som regel manglende
  privatlivserklæring eller en manglende rettighedsbeskrivelse — ikke koden.
- **Afvist i review?** Læs præcis hvilken retningslinje der henvises til, ret kun det,
  og svar i Resolution Center. En app med konti skal kunne slette kontoen inde i appen,
  og alt der ligner betaling skal gå gennem Apples egen betaling.
- En udgivelse er ikke slut ved upload. Den er slut når du har set en rigtig
  installation køre den nye version.
