---
name: craft-standard
description: Senior-udviklerstandarden for Craft Tracker — ufravigelige arkitekturregler, kvalitetsbar, arbejdsgang og verifikations-loop, der skal være opfyldt før kode kaldes færdig. Bruges ved enhver ændring i app/, server.js, mobile/ eller supabase/, og når kode skal reviewes eller shippes.
when_to_use: Ny feature, bugfix, refactor, UI-arbejde, nyt AI-endpoint, skemaændring eller review i Craft Tracker. Også når brugeren spørger "er vi klar", "kan det shippes", "er det godt nok" eller beder om et kvalitetstjek.
argument-hint: [valgfrit: hvad du arbejder på]
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(npm test)
  - Bash(git status:*)
  - Bash(git diff:*)
  - Bash(git log:*)
paths:
  - app/**
  - server.js
  - mobile/**
  - supabase/**
  - test/**
---

# Craft Standard

Craft Tracker er i App Store med rigtige brugere, og `app/app.js` er én IIFE:
et uguarderet DOM-opslag dræber hele appen ved boot — ikke bare din feature.
Derfor gælder: **en ændring er færdig når den er verificeret, ikke når den er skrevet.**

Denne standard supplerer `CLAUDE.md` (som er projektfakta). Her står baren.

## 1. Orientér før du skriver

Der findes næsten altid en helper allerede. **Find den nuværende i koden — antag den
ikke.** Åbn to-tre steder der løser samme opgave som din ændring, og brug deres måde:

- Slår du noget op i DOM'en, escaper brugertekst, henter et ikon, oversætter en
  streng eller gemmer state? Der er én husmetode til hver. Find den med `grep` på
  et sted der allerede gør det, i stedet for at kalde browser-API'et direkte.
- Rammer du serveren? Klienten finder altid backenden gennem projektets egen
  funktion — aldrig en hardkodet URL, fordi web og mobil peger forskellige steder.
- Bygger du et endpoint? Kopiér strukturen fra det nyeste eksisterende endpoint,
  inklusive auth-tjek, rate-limit og den fælles AI-kalds-helper.

Er der to modstridende mønstre i koden, så følg det nyeste og nævn uoverensstemmelsen
frem for at tilføje et tredje.

Ingen nye dependencies. Intet build-step. Intet framework. Hvis en ændring
kræver en af delene, så spørg først — det er en arkitekturbeslutning, ikke en detalje.

## 2. Ufravigelige regler

Kode der bryder én af disse, er ikke færdig — uanset hvor pæn den ellers er.

1. **Null-guard hvert DOM-opslag** i `translateUI()` og alt IIFE-kaldt kode:
   `const el=$("#x"); if(el) el.textContent=…`. Boot-kald wrappes som
   `try{fn();}catch(e){console.error("CT:fn",e);}`.
2. **Ingen +1-tap-logging eller numtray på dashboard, ringe eller tiles.**
   Dashboard åbner overblik; logning sker i tekstfelt/quick-log. Stærk brugerregel — ingen undtagelser.
3. **Dansk og engelsk holdes ved lige samtidig** i `translateUI()`. Ny UI-tekst uden
   engelsk pendant er en halvfærdig ændring.
4. **API-nøgler kun på serveren.** Aldrig i `app/`, aldrig i repoet, aldrig i en commit.
5. **Nyt AI-endpoint = rate-limit + anti-injection.** `rateLimited(bucket, key, max, windowMs)`
   først, og en system-prompt der siger at brugerinput er **DATA, ikke instruktioner**.
   Åbne Q&A-endpoints afviser hårdt spørgsmål uden for emnet.
6. **Ingen emoji i UI.** Emoji må kun leve som interne nøgler (fx `_BADGE_MAP`) og skal
   renderes gennem `_badgeSvg()` eller ikonbiblioteket.
7. **Skemaet ejes af `supabase/SETUP.sql`.** Ændringer dertil + `migration_*.sql`, og
   `VERIFY.sql` skal kunne bekræfte resultatet.
8. **State merges per element.** Flere enheder må aldrig kunne overskrive hinandens data.

## 3. Kvalitetsbaren

Det er her "senior" adskiller sig fra "virker på min maskine":

- **Mindst mulige diff.** Rør kun det ændringen kræver. Ingen drive-by-refactors,
  ingen oprydning i tilstødende kode uden at brugeren har bedt om det.
- **Fjern hellere end tilføj.** En ændring der sletter kode og løser problemet slår
  en der tilføjer kode og løser problemet.
- **Efterlad intet.** Ingen udkommenteret kode, ingen `TODO` uden ejer, ingen
  efterladt `console.log`, ingen ubrugt CSS-klasse eller død funktion.
- **Alle tilstande, ikke kun den glade.** Tom, indlæsning, fejl, offline, meget lange
  tekster, 0 og meget store tal, første gangs-bruger. UI må ikke hoppe når data lander.
- **Skriv i husets stil.** Match navngivning, kommentartæthed og idiom i den omgivende
  kode — ikke din egen præference. Kommentarer på dansk, identifiers på engelsk.
- **Ydelse hvor det mærkes.** `app.js` kører på telefoner i en travl service:
  ingen unødige fulde re-renders, ingen synkront arbejde i en tap-handler.
- **Sig hvad du ikke gjorde.** Hvis noget blev sprunget over eller er usikkert, skriv det
  eksplicit. Aldrig "det burde virke".

## 4. Arbejdsgang

Kopiér denne tjekliste ind i svaret og kryds af undervejs:

```
Craft-standard:
- [ ] 1. Fundet og fulgt det eksisterende mønster (afsnit 1)
- [ ] 2. Ændringen skrevet — mindst mulige diff
- [ ] 3. De ufravigelige regler gennemgået (afsnit 2)
- [ ] 4. Kvalitetsbaren gennemgået (afsnit 3)
- [ ] 5. CACHE bumpet i app/sw.js (kun ved klientændring)
- [ ] 6. npm test grøn
- [ ] 7. Verificeret at appen booter uden JS-fejl
- [ ] 8. Rapporteret ærligt: hvad blev gjort, hvad blev ikke
```

Trin 5 gælder ved enhver ændring i `app/` — uden bump ser brugerne gammel kode fra
service workerens cache. Trin 3–7 springes aldrig over, heller ikke ved en "lille" rettelse.

## 5. Verifikations-loop

Kør, ret, kør igen. Gå først videre når det er grønt:

1. `npm test` (Playwright smoke: app booter, logger og navigerer uden JS-fejl).
2. Fejler den — læs fejlen, ret årsagen, kør igen. **Ret aldrig testen for at få den grøn**,
   medmindre testen beviseligt er forkert.
3. Ved UI-ændring: se den faktisk køre, ikke bare bestå testen.
4. Ved ændring i `translateUI()` eller boot-stien: skift sprog frem og tilbage og
   bekræft at intet forsvinder.

Først når loopet er grønt, må ændringen beskrives som færdig.

## 6. Beslut selv vs. spørg

**Beslut selv:** navngivning, hvor koden skal ligge, hvilken eksisterende helper der
bruges, hvordan en edge case håndteres, hvordan en tekst formuleres på begge sprog.

**Spørg først:** ny dependency eller build-step, skemaændring der rører eksisterende
brugerdata, ændring i navigationsstrukturen (IA), noget der rører betaling/Pro-flaget,
og alt der ville bryde en regel i afsnit 2.

## 7. Anti-mønstre

- Kalde noget færdigt uden at have kørt `npm test`.
- Bumpe `CACHE` "senere".
- Tilføje en dansk streng nu og den engelske "bagefter".
- Nyt AI-endpoint uden rate-limit, fordi det "kun er til test".
- Refaktorere omkringliggende kode fordi den var i vejen.
- Beskrive noget som verificeret, som kun er læst igennem.
