---
name: visuel-verify
description: Ser en UI-ændring i Craft Tracker med friske øjne i stedet for at gætte — tager skærmbilleder i lyst og mørkt tema og på begge sprog mod stub-serveren, aflæser layout-tal, for små tryk-mål og navnløse knapper, og bedømmer resultatet i en fast rækkefølge. Bruges efter enhver ændring i app/, og når noget "ser forkert ud".
when_to_use: Efter en UI-ændring, før noget kaldes færdigt, når brugeren siger noget ser forkert ud, når et layout skal sammenlignes på tværs af tema eller sprog, eller når en tom eller ekstrem tilstand skal efterprøves.
argument-hint: [view: vagt|stats|vin|feed|profile|history|social|lab]
allowed-tools:
  - Read
  - Bash(node .claude/skills/visuel-verify/scripts/shot.js:*)
  - Bash(npm test)
paths:
  - app/**
---

# Visuel verifikation

En grøn test beviser at appen ikke crashede. Den siger intet om, hvorvidt skærmen
er god. **Se den.** Alt herunder handler om at erstatte "det burde se fint ud"
med noget du faktisk har kigget på.

## 1. Tag billedet

```bash
node .claude/skills/visuel-verify/scripts/shot.js stats
```

| Flag | Gør |
|---|---|
| `--dark` | mørkt tema |
| `--en` | engelsk UI |
| `--full` | hele siden, ikke kun det synlige |
| `--state fil.json` | brug dine egne data som `mise_state_v2` (tom, ekstrem, ét element …) |
| `--out fil.png` | vælg filsti |
| `--wait 1200` | ekstra ventetid, hvis skærmen henter noget |

Views: `vagt stats vin feed profile history social lab`.

Scriptet starter selv stub-serveren, sår localStorage med en indlogget demobruger,
tager billedet — og **fejler (exit 1) hvis der var en uopfanget JS-fejl**. Læs altid
PNG'en bagefter med Read; pointen er at kigge, ikke at filen blev skrevet.

Udover billedet skriver det fire ting, du ellers ville skulle gætte:

- `scrollWidth` mod `clientWidth` — vandret overflow, den fejl der er sværest at se på et billede
- hvilke synlige elementer der stikker ud over højre kant
- tryk-areal under 44×44 (Apples grænse — og for lille til fedtede fingre). Det måles
  ved at spørge browseren hvad der faktisk rammes 21 px ude i hver retning fra midten,
  så et hit-areal udvidet med et pseudo-element tæller korrekt med
- knapper uden tekst og uden `aria-label`, altså usynlige for VoiceOver

**Tryk-mål-tjekket er en heuristik.** Det aflæser det øverste element i hvert
probe-punkt, så et mål der overlappes tæt på kanten kan blive meldt for lille selvom
det er fint. **Efterprøv et flag før du rapporterer det** — mål elementet og se hvad
der ligger oven på det. Det er sådan en usynlig overlejring bliver afsløret:
en skjult toast der lå og opsnappede tryk over log-knappen, blev fundet præcis sådan.

## 2. Bedøm i denne rækkefølge

Kig efter i den rækkefølge her — den går fra "ødelagt" til "kan poleres":

1. **Rammer øjet det rigtige først?** Det vigtigste tal på skærmen skal vinde.
   Hvis blikket lander på en etiket eller en kant, er hierarkiet forkert.
2. **Linjelængde.** Brødtekst vil have 45–75 tegn per linje. En tekst der brækker i
   en søjle på tre-fire ord ser i stykker ud, selvom CSS'en er "gyldig" — typisk
   fordi en container arver en bredde den ikke skulle have.
3. **Rytme.** Ligger afstandene på den samme skala, eller er der 12, 13 og 15 px i
   samme kort? Er venstrekanterne på linje ned gennem skærmen?
4. **Kanter.** Overflow, afskåret tekst, et kort der er 2 px bredere end naboen.
5. **Tryk-mål og tommelzone.** Er den primære handling nede, hvor tommelfingeren er?
6. **Begge temaer.** Mørkt tema er ikke lyst tema med ombyttede farver. Kig efter
   grå tekst der forsvinder, kanter der bliver usynlige, skygger der bliver til plamager.
7. **Tom og ekstrem tilstand.** Kør `--state` med ingen data og med urealistisk meget.
   De fleste designfejl bor her, fordi ingen kigger på dem.
8. **Bevægelse.** Hopper layoutet når data lander?

Et fund lyder konkret: *"tomme-tilstanden på Stats brækker i en søjle på fire ord,
fordi teksten arver bredden fra achievement-gitteret"* — ikke *"tom tilstand ser lidt underlig ud"*.

## 3. Sammenlign varianter

Fejl viser sig i forskellen, ikke i det enkelte billede:

```bash
node .claude/skills/visuel-verify/scripts/shot.js stats
node .claude/skills/visuel-verify/scripts/shot.js stats --dark
node .claude/skills/visuel-verify/scripts/shot.js stats --en
node .claude/skills/visuel-verify/scripts/shot.js stats --state /tmp/tom.json
```

Læs de fire billeder ved siden af hinanden. Dansk mod engelsk afslører etiketter der
kun lige passede; tom mod fyldt afslører skærme der kun blev designet i én tilstand.

## 4. Læs tallene, ikke kun pixels

Et skærmbillede kan lyve — om kanter, om hvad der er skjult, om hvad der er
klippet af selve optagelsen. Derfor aflæser scriptet layoutet fra DOM'en.
**Når billede og tal er uenige, har tallene ret.** Bekræft altid en mistanke om
et afskåret layout mod `scrollWidth`/`clientWidth`, før du retter i CSS.

## 5. Loopet

```
- [ ] 1. Skyd skærmen (lys + mørk, begge sprog hvis teksten er ændret)
- [ ] 2. Læs PNG'erne og scriptets tal
- [ ] 3. Skriv fundene ned — konkret, ikke "ser lidt off ud"
- [ ] 4. Ret ét fund ad gangen
- [ ] 5. Skyd igen og bekræft
- [ ] 6. npm test grøn til sidst
```

Ret aldrig fra hukommelsen. Skyd igen efter hver rettelse — en rettelse der løser
det ene og brækker det andet, er den almindeligste måde en UI-fejl overlever på.

## 6. Hvis Playwright ikke er tilgængeligt

Fald tilbage til headless Chrome — men kend de to fælder, det har kostet tid før:

- **Højre kant ser klippet ud.** Headless `--screenshot` lægger siden ud bredere end
  den PNG den fanger. Det er ikke en CSS-fejl. Bekræft med `getBoundingClientRect()`
  eller `--dump-dom` i stedet for at rette i layoutet.
- **Spinner der aldrig bliver færdig.** Med `--virtual-time-budget` når sene fetches
  aldrig at svare. Brug rigtig tid (`--timeout`) i stedet, og hold load-eventet åbent
  med en langsom ressource, så Chrome ikke fanger for tidligt.
- Kør kun én Chrome ad gangen, hver med sin egen `--user-data-dir`.

## 7. Rapportér ærligt

Skriv hvad du så, og hvor billedet ligger. Hvis du ikke har kigget på skærmen,
så sig det — "testen er grøn" og "jeg har set at den ser rigtig ud" er to
forskellige påstande, og kun den ene må kaldes verifikation.
