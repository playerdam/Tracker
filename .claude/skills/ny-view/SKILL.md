---
name: ny-view
description: Designer og bygger en ny skærm, fane, modal eller drawer i Craft Tracker til produktstandard — brugssituation, ét job per skærm, tommelzone og tryk-mål, de fem tilstande, tilgængelighed, tekstvækst ved sprogskift, bevægelse og dårligt netværk. Bruges også når en eksisterende skærm skal gøres bedre.
when_to_use: Ny view, ny fane, ny modal, ny drawer, nyt panel, ombygning eller oprydning i en eksisterende skærm, eller når en skærm "føles forkert" og skal løftes.
argument-hint: [skærmens navn]
allowed-tools:
  - Read
  - Grep
  - Glob
paths:
  - app/**
---

# Ny skærm i Craft Tracker

En skærm er ikke færdig fordi den viser de rigtige data. Den er færdig når den
virker for personen der bruger den, i den situation de er i.

## 1. Brugssituationen afgør designet

Craft Tracker bruges **midt i en service**, ikke ved et skrivebord. Det er den
vigtigste designoplysning i projektet, og den har konsekvenser:

| Virkelighed | Konsekvens for skærmen |
|---|---|
| Én hånd, telefonen holdes lavt | Alt der skal trykkes på, hører til i nederste tredjedel |
| Våde, fedtede eller kolde fingre | Tryk-mål mindst 44×44 pt, mindst 8 px mellem to mål |
| 5 sekunder mellem to opgaver | Ét tal skal kunne aflæses uden at læse skærmen |
| Larm, stress, afbrydelser | Ingen flertrinsflow uden at delvist arbejde overlever en afbrydelse |
| Mørk restaurant eller skarpt køkkenlys | Skal fungere i både lyst og mørkt tema, ikke kun det du kigger på |
| Kælder-wifi og 3G | Skærmen må aldrig stå død og vente |
| Handsker eller travlhed | Ingen præcisionsgestus: ingen langt-tryk som eneste vej, ingen små swipe-zoner |

Skriv brugssituationen ned for netop denne skærm før du åbner en fil. Hvis den
ikke kan besvares, er featuren ikke moden nok til at blive bygget.

## 2. Ét job per skærm

Svar i én sætning: **hvad skal brugeren kunne, når denne skærm er åben?**

- Ét primært job, én primær handling. Alt andet er sekundært og skal se sekundært ud.
- Den primære handling er synlig uden at scrolle.
- Hvis to handlinger er lige vigtige, er det to skærme — eller featuren er ikke tænkt færdig.
- Hvad sker der bagefter? En skærm uden en klar udgang er en blindgyde.

**Undgå at flytte logning ind på overbliksskærme.** Overblik åbner detaljer;
logning sker i tekstfelt og quick-log. Det er en fast produktbeslutning, ikke en detalje.

## 3. De fem tilstande

Hver skærm skal designes i alle fem, ikke kun den midterste:

1. **Første gang** — ingen data endnu. Hvad ser en ny bruger? En tom skærm er
   spildt plads: fortæl hvad skærmen bliver til, og giv én vej videre.
2. **Indlæser** — brug en skeleton der har formen af det der kommer, ikke en spinner,
   når layoutet er kendt. Ingen hop når data lander.
3. **Fyldt** — det normale.
4. **Fejl og offline** — hvad kan brugeren stadig gøre? Vis hvad der er gemt lokalt,
   og hvad der venter på at blive synket.
5. **Ekstremt** — 1 element og 500 elementer. Et navn på 60 tegn. Tallet 0 og tallet
   1.284.930. Et billede der ikke loader. Test med de tal, ikke med "Test 1".

## 4. Tilgængelighed er ikke ekstraarbejde

- **Kontrast:** mindst 4,5:1 for brødtekst, 3:1 for stor tekst og for de grafiske
  elementer der bærer betydning — **i begge temaer**. Mørkt tema er ikke lyst tema med
  ombyttede farver; tjek det selvstændigt.
- **Ikon-knapper skal have et navn.** En knap med kun en SVG og ingen `aria-label`
  er usynlig for VoiceOver. Ingen undtagelser.
- **Farve må aldrig bære betydning alene.** Rød/grøn skal også adskille sig i form,
  ikon eller tekst.
- **Tekst under ~13 px er ikke læsbar** på en telefon i et køkken. Brug det ikke som
  en måde at få mere til at passe ind.
- **Respekter `prefers-reduced-motion`.** Slå ikke-nødvendig animation fra.

## 5. To sprog fra første linje

Dansk og engelsk holdes ved lige samtidig — ikke "det andet sprog bagefter".

- Regn med at en streng kan vokse 30 % ved oversættelse. Ingen knap med fast bredde
  omkring et ord, ingen etiket der kun lige passer.
- Tal, datoer og klokkeslæt følger sproget.
- Læs skærmen på begge sprog før du kalder den færdig — det er ét flag i
  verifikationsscriptet, ikke en stor øvelse.

## 6. Bevægelse med et formål

Animation skal enten forklare hvor noget kom fra, eller kvittere for et tryk.
Alt andet er støj, der koster tid i en travl service.

- 150–250 ms. Ease-out ind, hurtigere ud.
- Aldrig blokere input mens den kører.
- Aldrig animere noget brugeren venter på.

## 7. Dårligt netværk er normaltilstanden

- Handlinger gemmes lokalt først og synkes bagefter — brugeren skal ikke vente på serveren.
- Vis aldrig en tom skærm mens der hentes, hvis der findes lokale data at vise.
- Synk skal flette per element, så to enheder ikke slår hinandens data ihjel.

## 8. Sådan hænger en skærm sammen i denne app

Kodemønstret ændrer sig over tid — find det nyeste i stedet for at antage:

1. `grep` efter en eksisterende søskende-skærm og kopiér dens struktur, ikke din egen.
2. Registrér skærmen i tab-skift-funktionen, så den tændes og slukkes med de andre.
3. Tilføj al ny tekst på **begge** sprog samme sted som de øvrige oversættelser.
4. **Null-guard hvert eneste DOM-opslag.** `app.js` er én IIFE — et opslag der rammer
   `null` ved boot dræber hele appen, ikke kun din skærm.
5. Bump service worker-cachen ved enhver ændring i `app/`.

## 9. Færdig-tjekliste

```
Ny skærm:
- [ ] Brugssituation skrevet ned (afsnit 1)
- [ ] Ét job, én primær handling, synlig uden scroll
- [ ] Alle fem tilstande designet — også tom og ekstrem
- [ ] Tryk-mål ≥44px, primær handling i nederste tredjedel
- [ ] Kontrast tjekket i BEGGE temaer
- [ ] Alle ikon-knapper har aria-label
- [ ] Dansk og engelsk på plads samtidig
- [ ] Alle DOM-opslag null-guardet
- [ ] Set med /visuel-verify — ikke kun testet
- [ ] sw.js CACHE bumpet, npm test grøn
```

Sidste punkt er ikke en formalitet: en skærm du ikke har set, er en skærm du ikke ved virker.
