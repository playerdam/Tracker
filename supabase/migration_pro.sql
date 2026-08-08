-- Pro-abonnement: tilføjer pro_until til din LIVE users-tabel.
-- Kør i Supabase SQL Editor. Idempotent (kan køres igen).
alter table users add column if not exists pro_until timestamptz;

-- Prøveperioden håndteres af Apples abonnement (introductory offer, Fase 2).
-- Nye brugere er gratis som standard; køb i appen sætter pro_until via RevenueCat.

-- ── Til test: gør DIG SELV til permanent Pro ──
-- update users set pro_until = now() + interval '10 years' where username = 'DIT_BRUGERNAVN';
--
-- ── Slå Pro fra igen (test gratis-tilstand / paywall) ──
-- update users set pro_until = null where username = 'DIT_BRUGERNAVN';
