# Supabase — database

Tre filer, kør i Supabase SQL Editor:

| Fil | Hvad | Hvornår |
|-----|------|---------|
| **SETUP.sql** | Hele skemaet (14 tabeller, RLS, storage-buckets, seed). Idempotent. | Opsætning af en ny database. Vil du wipe først: fjern `--` foran WIPE-blokken (sektion 0). |
| **VERIFY.sql** | Read-only tjek: er alt oprettet? Viser ✅/❌ pr. objekt. | Efter SETUP, eller når du er i tvivl om noget mangler. |
| **METRICS.sql** | Read-only nøgletal (brugere, aktive, logs, social, hold, Lab…). | Løbende overblik. Tryk "Save snippet" for ét-kliks-adgang. |

SETUP.sql er den samlede kilde til sandhed — den erstatter de tidligere
fragmenterede migration-filer.
