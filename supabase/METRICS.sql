-- ════════════════════════════════════════════════════════════════════════
--  CRAFT TRACKER — NØGLETAL / DASHBOARD
--  Kør i Supabase SQL Editor. Tryk "Save snippet" så den er ét klik væk næste
--  gang. Read-only — helt sikker at køre når som helst.
-- ════════════════════════════════════════════════════════════════════════
with m(n, metric, value) as (
  -- Brugere
  select 1,  'Brugere i alt',                 count(*)::text from users
  union all select 2,  'Nye brugere (7 dage)',        count(*)::text from users where created_at > now() - interval '7 days'
  union all select 3,  'Nye brugere (24 timer)',      count(*)::text from users where created_at > now() - interval '1 day'
  -- Aktivitet (fra app_events — kræver at appen sender events)
  union all select 4,  'Aktive brugere i dag',        count(distinct user_id)::text from app_events where created_at::date = current_date
  union all select 5,  'Aktive brugere (7 dage)',     count(distinct user_id)::text from app_events where created_at > now() - interval '7 days'
  -- Logning
  union all select 6,  'Log-indgange i alt',          count(*)::text from log_entries
  union all select 7,  'Logs i dag',                  count(*)::text from log_entries where logged_at::date = current_date
  union all select 8,  'Logs (7 dage)',               count(*)::text from log_entries where logged_at > now() - interval '7 days'
  -- Social
  union all select 9,  'Følge-relationer',            count(*)::text from follows where status = 'accepted'
  union all select 10, 'Afventende følge-anmodninger', count(*)::text from follows where status = 'pending'
  union all select 11, 'Likes',                       count(*)::text from likes
  union all select 12, 'Kommentarer',                 count(*)::text from comments
  -- Hold
  union all select 13, 'Hold',                        count(*)::text from teams
  union all select 14, 'Hold-medlemskaber',           count(*)::text from team_members
  -- The Lab
  union all select 15, 'Lab-retter',                  count(*)::text from lab_dishes
  union all select 16, 'Lab billed-analyser',         count(*)::text from lab_entries
  -- Engagement / konvertering
  union all select 17, 'Push-tilmeldte',              count(*)::text from push_subs
  union all select 18, 'Pro-venteliste',              count(*)::text from pro_waitlist
)
select metric as "Nøgletal", value as "Antal" from m order by n;
