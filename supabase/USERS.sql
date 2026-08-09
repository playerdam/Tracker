-- ============================================================================
--  USERS.sql — se hvem der er oprettet (navn, email, pro, m.m.)
--  Kør i Supabase Dashboard → SQL Editor. Læser auth.users (email) + users.
-- ============================================================================

-- ── QUERY A: virker NU (uden pro_until-kolonnen) ───────────────────────────
--  Brug denne hvis migration_pro.sql endnu ikke er kørt.
select
  coalesce(u.username, '—')   as brugernavn,
  coalesce(u.nickname, '—')   as kaldenavn,
  au.email                     as email,
  coalesce(u.profession, '—') as rolle,
  coalesce(u.workplace, '—')  as arbejdssted,
  au.created_at                as oprettet
from auth.users au
left join users u on u.id = au.id
order by au.created_at desc;


-- ── QUERY B: med Pro Ja/Nej ────────────────────────────────────────────────
--  Kræver pro_until-kolonnen. Kør denne ENE linje FØRSTE gang (ufarlig,
--  idempotent — koden rører først kolonnen når betaling tændes):
--     alter table users add column if not exists pro_until timestamptz;
--
--  Kør derefter:
-- select
--   coalesce(u.username, '—')   as brugernavn,
--   coalesce(u.nickname, '—')   as kaldenavn,
--   au.email                     as email,
--   case
--     when u.pro_until is null      then 'nej'
--     when u.pro_until > now()      then 'ja'
--     else                                'udløbet'
--   end                          as pro,
--   u.pro_until                  as pro_udløber,
--   au.created_at                as oprettet
-- from auth.users au
-- left join users u on u.id = au.id
-- order by au.created_at desc;
