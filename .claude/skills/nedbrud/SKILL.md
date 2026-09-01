---
name: nedbrud
description: Triagerer et nedbrud i Craft Tracker i produktion — afgrænser hvad der er nede, finder årsagen i fast rækkefølge (sidste deploy, Railway-logs, klient-crash, Supabase, AI), vælger den hurtigste vej tilbage, og siger hvad man aldrig gør under pres. Bruges når appen, backenden eller en enkelt funktion er i stykker for rigtige brugere.
when_to_use: Appen er nede, hvid skærm, brugere melder fejl, et endpoint fejler, noget holdt op med at virke efter en udrulning, eller der skal rulles tilbage.
allowed-tools:
  - Read
  - Grep
  - Bash(git log:*)
  - Bash(git status:*)
  - Bash(git diff:*)
  - Bash(curl:*)
paths:
  - server.js
  - app/**
---

# Nedbrud i produktion

Under pres er den største risiko ikke at man ikke finder fejlen — det er at man
ændrer fem ting på én gang og mister overblikket over hvad der virkede.
Én ændring ad gangen, og skriv ned hvad du gør.

## 1. Afgræns før du retter

Svar på de tre spørgsmål i denne rækkefølge. De koster hver især under et minut,
og de udelukker det meste:

1. **Er backenden i live?** `curl https://<railway-url>/api/health` svarer med
   `{ok:true}` plus status på push. Svarer den ikke, er det backenden — ikke klienten.
2. **Er det alle eller én?** Én bruger = data, konto eller en gammel appversion.
   Alle = udrulning eller en afhængighed.
3. **Er det web, iOS eller begge?** Kun iOS = noget i det byggede klientlag, og så
   kan brugerne ikke selv hente en rettelse — se afsnit 4.

## 2. Find årsagen i fast rækkefølge

1. **Var det min sidste udrulning?** Langt de fleste nedbrud er den seneste ændring.
   `git log` mod tidspunktet hvor det begyndte at fejle. Passer de sammen, har du
   svaret — kig ikke længere.
2. **Railway-logs.** Serverens fejl står der. Læs den *første* fejl i rækken,
   ikke den sidste; resten er typisk følgefejl.
3. **Klient-crash.** Klienten sender uopfangede fejl til `/api/client-error`, som
   logger dem serverside med `[client-error]`. En hvid skærm hos brugerne er næsten
   altid ét uguarderet DOM-opslag der dræber hele IIFE'en ved boot — det er den
   dyreste fejlklasse i dette projekt, og den ser ud som om "alt er væk".
4. **Supabase.** Er databasen oppe, og er der noget galt med auth? Serveren kører
   med `service_role`; fejler den, fejler alle data-endpoints på én gang.
5. **AI-endpoints.** De fejler for sig. Er kun parse-log, vin-søgning eller stats
   nede, er resten af appen rask — og `parse-log` har en lokal fallback, så
   hurtig-log skal stadig virke. Gør den ikke det, er fallbacken selv brudt.

## 3. Vælg den hurtigste vej tilbage

Rækkefølgen er ikke "find den pæneste rettelse". Den er "få brugerne op igen":

1. **Rul tilbage**, hvis den sidste udrulning er skyldig. Hurtigst og mest sikkert.
2. **Slå funktionen fra** med et flag, hvis det kun er én ting der er gal.
3. **Ret fremad**, når årsagen er forstået og rettelsen er lille.

Ret aldrig fremad på en fejl du ikke har forstået. Rul tilbage først, forstå bagefter.

## 4. iOS kan ikke få en hurtig rettelse

En rettelse i klientlaget skal gennem App Store review, og brugerne skal selv
opdatere. Det tager dage, ikke minutter. Derfor gælder:

**En fejl der rammer iOS-brugere skal om muligt løses på serveren.** Et flag,
et ændret svar, en serverside-guard. Klientrettelsen kan følge bagefter i næste
udgivelse — den er ikke redningen.

## 5. Det man aldrig gør under pres

- **Slukker for Railway.** Det er appens backend. Den slukkes ikke, uanset hvad.
- Kører en skemaændring for at "prøve noget". Migrationer under pres laver
  datatab, og datatab kan ikke rulles tilbage.
- Force-pusher.
- Ændrer flere ting på én gang, så du ikke kan se hvad der hjalp.
- Kalder det løst, fordi det virker på din maskine. Bekræft mod produktion.

## 6. Bagefter

Nedbruddet er først slut når det er svært at gentage:

```
- [ ] Brugerne er oppe igen — bekræftet mod produktion, ikke lokalt
- [ ] Årsagen forstået og skrevet ned i én sætning
- [ ] Den rigtige rettelse på plads, hvis der blev rullet tilbage eller slukket
- [ ] Spurgt: hvad fangede det ikke? Tilføj den test eller det null-guard
- [ ] Flaget slået til igen, hvis noget blev slukket
```

Det vigtigste punkt er det næstsidste. En røgtest der havde fanget fejlen, er
mere værd end en hurtig rettelse.
