---
name: ux-kritik
description: Gennemgår et eksisterende flow i Craft Tracker som bruger og finder hvad der er galt med det — måler tryk og trin frem for at mene noget, stiller de spørgsmål der finder mest, skelner mellem brudt, friktion og smag, og rangordner fund efter hvad de koster brugeren.
when_to_use: Noget føles forkert, klodset eller besværligt; et flow skal gennemgås; brugeren spørger hvorfor folk falder fra et sted; eller en eksisterende funktion skal forbedres frem for udvides.
argument-hint: [flow, fx "log en vagt" eller "tilføj vin"]
---

# UX-kritik

Kritik af et flow, du selv har bygget, er svær af én grund: du kender vejen.
Derfor måler denne skill frem for at mene, og går flowet i den rækkefølge
brugeren møder det — ikke i den rækkefølge koden er skrevet.

## 1. Start hvor brugeren starter

Ikke ved funktionen. Ved situationen:

- Appen åbnes koldt, midt i en service, med én hånd.
- Eller den åbnes efter en notifikation, med et bestemt ærinde.
- Eller det er første gang nogensinde, og der er ingen data.

Gå hele vejen fra dét punkt til målet er nået. Spring intet over, fordi du ved
hvor knappen er.

## 2. Mål, i stedet for at mene

Skriv tallene ned, før du vurderer noget:

- **Antal tryk** fra åbning til målet er nået.
- **Antal skærme** man passerer.
- **Antal gange** brugeren skal huske noget fra en tidligere skærm.
- **Tid til første nyttige tilbagemelding** — hvornår ved man, at det virkede?
- **Antal beslutninger** man tvinges til at træffe undervejs.

Tallene gør kritikken diskuterbar. "Fire tryk for at logge én ting" er en påstand,
man kan forholde sig til. "Det føles tungt" er det ikke.

## 3. De spørgsmål, der finder mest

1. **Hvad kom brugeren for?** Hvor mange tryk til dét — og hvor mange til alt det andet?
2. **Hvor spørger appen om noget, den kunne regne ud, huske eller gætte kvalificeret?**
   Hvert spørgsmål, der kan besvares af appen selv, er et tryk for meget.
3. **Hvor skal man huske noget** fra en tidligere skærm for at komme videre?
4. **Hvor kan man miste arbejde?** Afbrydelse er normaltilstanden i en service —
   et flow, der ikke overlever en afbrydelse midtvejs, er brudt, ikke ubelejligt.
5. **Hvor er blindgyden?** En skærm uden en klar vej videre eller tilbage.
6. **Hvad sker der, hvis man gør det forkerte?** Kan det fortrydes, og er
   fortryd-muligheden der stadig, når man opdager fejlen et halvt minut senere?
7. **Hvad ser en helt ny bruger?** De fleste flow er kun designet i den tilstand,
   hvor der allerede er data.
8. **Hvad er det tredje tryk?** De to første er som regel gennemtænkte. Slæbet
   begynder derefter.

## 4. Fem-sekunders-prøven

Kan en kok med én hånd, fedtede fingre og fem sekunder komme igennem?
Kan de ikke det, er resten af analysen ligegyldig.

## 5. Skeln mellem tre slags fund

| Slags | Kendetegn | Rapportér |
|---|---|---|
| **Brudt** | Brugeren kan ikke gennemføre, eller mister arbejde | Altid, øverst |
| **Friktion** | De kan godt, men det koster tryk, tid eller tvivl | Altid, rangordnet |
| **Smag** | Du ville have gjort det anderledes | Kun hvis du siger, at det er smag |

At blande de tre er den hurtigste måde at få kritik ignoreret på. Vær eksplicit,
når noget er det tredje.

## 6. Skriv fundene sådan

Hvert fund: **hvad**, **hvor i flowet**, **hvad det koster brugeren**, og
**hvad det ville kræve at rette**. Rangordnet efter hvad det koster *brugeren* —
ikke efter hvad det koster at rette. Det er to forskellige lister, og kun den
første er en UX-vurdering.

Slut med den ene ting, du ville rette først, og hvorfor.

## 7. Arbejdsgangen

```
UX-kritik:
- [ ] 1. Vælg ét flow og ét udgangspunkt (kold start, notifikation, første gang)
- [ ] 2. Gå hele flowet igennem — se skærmene, brug /visuel-verify
- [ ] 3. Skriv tallene ned (afsnit 2)
- [ ] 4. Stil de otte spørgsmål (afsnit 3)
- [ ] 5. Sortér fundene i brudt / friktion / smag
- [ ] 6. Rangordn efter hvad de koster brugeren
- [ ] 7. Anbefal én rettelse først
```

**Ret ikke undervejs.** Gå hele flowet først. Retter du det første, du finder,
ser du aldrig mønsteret — og mønsteret er som regel det egentlige fund.
