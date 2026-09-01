---
name: bagudkompatibilitet
description: Beskytter de klienter der allerede er ude hos brugerne, når API, skema eller gemt state ændres i Craft Tracker — hvilke ændringer der er sikre, expand/contract-rækkefølgen, skemaændringer under live data, og hvordan feature-flag bruges når klienten ikke kan opdateres. Bruges ved enhver ændring af et svar, et felt, en tabel eller et gemt dataformat.
when_to_use: Ændring i et API-svar eller request-format, ny eller ændret kolonne i Supabase, migration, ændring i mise_state_v2 eller anden gemt state, fjernelse af et felt, eller når noget skal udrulles i en bestemt rækkefølge.
allowed-tools:
  - Read
  - Grep
  - Glob
paths:
  - server.js
  - supabase/**
  - app/**
---

# Bagudkompatibilitet

**Dine iOS-brugere opdaterer ikke.** En app der blev installeret i dag kalder dit API
uændret om seks måneder. Backenden udrulles på sekunder ved et push; klienten
udrulles kun når brugeren selv opdaterer — hvis de nogensinde gør det.

Derfor er der på ethvert tidspunkt flere klientversioner i luften mod én backend.
Det er den præmis alle regler herunder følger af.

## 1. Er ændringen sikker?

**Sikkert — gammel klient mærker intet:**

- Tilføje et nyt felt til et svar
- Tilføje et valgfrit felt til et request
- Tilføje et nyt endpoint
- Tilføje en nullable kolonne, eller en med default
- Gøre en validering mildere

**Usikkert — knækker en klient der er ude:**

- Omdøbe eller fjerne et felt i et svar
- Gøre et valgfrit request-felt påkrævet
- Ændre typen på et felt (`"12"` → `12`, tal → objekt)
- Ændre *betydningen* af en værdi, uden at navnet ændrer sig — den farligste,
  fordi intet fejler; dataene bliver bare stille forkerte
- Stramme en validering eller sænke en grænse
- Fjerne en enum-værdi klienten kan sende
- Ændre en statuskode klienten forgrener på

Skal du gøre noget fra den anden liste, så brug expand/contract.

## 2. Expand/contract

Aldrig i én udrulning. Altid i denne rækkefølge, med tid imellem:

1. **Expand** — tilføj det nye ved siden af det gamle. Serveren accepterer og
   leverer begge. Ingen klient mærker noget.
2. **Migrér** — flyt data og skriv til begge. Nye klienter bruger det nye felt.
3. **Vent** — indtil så få gamle klienter er tilbage, at det er forsvarligt.
   Det er måneder, ikke dage. Mål det, gæt det ikke.
4. **Contract** — fjern det gamle.

Trin 4 er det eneste farlige trin, og det er også det eneste der kan udsættes
i det uendelige uden omkostning. Hast aldrig med det.

## 3. Rækkefølgen ved udrulning

**Backend først, klient bagefter. Altid.**

En ny klient der rammer et gammelt API er ødelagt for alle der opdaterer hurtigt.
En gammel klient der rammer et nyt API er fint — hvis reglerne i afsnit 1 er fulgt.
Derfor: push backenden, se den er oppe, og send så klienten til review.

## 4. Skemaændringer under live data

- Tilføj kolonner som nullable eller med default. En `NOT NULL` uden default på en
  tabel med data fejler, og den fejler midt i en udrulning.
- Backfill som et separat, genkørbart skridt — ikke som en del af migrationen.
  Den skal kunne afbrydes og køres igen uden at lave rod.
- Skriv aldrig en migration der ikke kan rulles tilbage uden datatab. Kan den ikke,
  så del den op indtil den kan.
- Kør `VERIFY.sql` bagefter og bekræft resultatet, frem for at antage at det gik godt.
- Serveren bypasser RLS med `service_role`. Nye tabeller skal alligevel have RLS slået
  til fra starten — ellers er der ingen sikkerhedsnet den dag klienten rammer dem direkte.

## 5. Gemt state på enheden

Brugerens tællere, vine og vagthistorik ligger i `localStorage` på en telefon, du
ikke kan nå. Behandl det som et dataformat med samme regler som API'et:

- Nye felter skal have en fornuftig værdi når en gammel, gemt state indlæses.
  Læs aldrig et nyt felt uden en default.
- Fjern aldrig et felt en tidligere version stadig skriver til.
- Migrér gammel state ved indlæsning, én gang, og gem resultatet — ikke ved hvert opslag.
- Synk skal flette per element. To enheder med hver sin appversion må ikke kunne
  slå hinandens data ihjel.

## 6. Når klienten ikke kan opdateres

Det er her feature-flag tjener sit navn. Et flag på serveren lader dig tænde og
slukke funktionalitet uden en ny udgivelse i App Store — og det er den eneste
hurtige vej, når noget skal stoppes for brugere der sidder med en gammel app.

Byg derfor nye, risikable funktioner bag et flag fra starten, ikke bagefter.

## 7. Tjekliste

```
Bagudkompatibilitet:
- [ ] Ændringen er additiv (eller kørt gennem expand/contract)
- [ ] Intet felt omdøbt, fjernet, typeskiftet eller omfortolket
- [ ] Gammel klient afprøvet mod det nye API
- [ ] Migration er rulbar tilbage uden datatab; backfill er et separat, genkørbart skridt
- [ ] Ny gemt-state-felt har en default når gammel state indlæses
- [ ] Backend udrullet FØR klienten sendes afsted
- [ ] Risikabel funktion ligger bag et flag
```
