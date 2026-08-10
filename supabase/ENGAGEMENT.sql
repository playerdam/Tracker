-- ════════════════════════════════════════════════════════════════════════
--  CRAFT TRACKER — ENGAGEMENT / "VIRKER BETA'EN?"
--  Kør i Supabase SQL Editor. Read-only, helt sikker at køre når som helst.
--
--  VIGTIGT: kør ÉN forespørgsel ad gangen — markér blokken (mellem -- ▼ og
--  næste -- ▼) og tryk Run. SQL Editor viser kun resultatet af den SIDSTE
--  forespørgsel hvis du kører hele filen.
--
--  Hvor METRICS.sql svarer "hvor stort" (antal), svarer denne "virker det"
--  (fastholdelse, hvem er aktive, hvad bliver brugt).
-- ════════════════════════════════════════════════════════════════════════


-- ▼ 1) KERNE-LØKKE-TRAGT — af dem der opretter sig, hvor mange når hvert trin?
--    Det vigtigste enkeltbillede: falder folk fra før de får logget noget?
with signups     as (select count(*) n from auth.users),
     active      as (select count(distinct user_id) n from app_events),
     logged      as (select count(distinct user_id) n from log_entries),
     repeat_log  as (select count(*) n from (select user_id from log_entries group by user_id having count(distinct logged_at::date) >= 2) x),
     shifted     as (select count(distinct user_id) n from app_events where event = 'shift_start')
select * from (
            select 1 k, 'Oprettet konto'      trin, (select n from signups)    brugere, 100                                                                  pct
  union all select 2,   'Åbnet appen',              (select n from active),     round(100.0*(select n from active)    /nullif((select n from signups),0))
  union all select 3,   'Logget ≥1 gang',           (select n from logged),     round(100.0*(select n from logged)    /nullif((select n from signups),0))
  union all select 4,   'Logget på ≥2 dage',        (select n from repeat_log), round(100.0*(select n from repeat_log)/nullif((select n from signups),0))
  union all select 5,   'Startet en vagt',          (select n from shifted),    round(100.0*(select n from shifted)   /nullif((select n from signups),0))
) t order by k;


-- ▼ 2) FASTHOLDELSE — hvor mange dage er hver bruger aktiv? (1 dag = prøvede én gang)
--    "Kommer-tilbage" = 2+ dage. Superbrugere = 5+.
with ad as (select user_id, count(distinct created_at::date) dage from app_events group by user_id)
select
  case when dage >= 5 then '5+ dage  (superbruger)'
       when dage >= 3 then '3–4 dage'
       when dage  = 2 then '2 dage   (kom tilbage)'
       else                '1 dag    (prøvede én gang)' end as fastholdelse,
  count(*) as brugere
from ad
group by 1
order by min(dage) desc;


-- ▼ 3) AKTIVITET PR. BRUGER — den vigtigste tabel. Hver tester + hvad de gjorde.
with logs as (
  select user_id, count(*) n, count(distinct logged_at::date) d, max(logged_at) last
  from log_entries group by user_id
), ev as (
  select user_id,
         count(distinct created_at::date) d,
         max(created_at) last,
         count(*) filter (where event = 'shift_start')  shifts,
         bool_or(event = 'resume_open')                 cv_open,
         bool_or(event = 'resume_share')                cv_share
  from app_events group by user_id
)
select
  coalesce(u.username, '—')                          as bruger,
  au.email,
  au.created_at::date                                as oprettet,
  coalesce(l.n, 0)                                   as logs,
  coalesce(l.d, 0)                                   as log_dage,
  coalesce(e.d, 0)                                   as aktive_dage,
  greatest(l.last, e.last)::date                     as sidst_aktiv,
  coalesce(e.shifts, 0)                              as vagter,
  coalesce(e.cv_open, false)                         as åbnet_cv,
  coalesce(e.cv_share, false)                        as delt_cv
from auth.users au
left join users       u on u.id = au.id
left join logs        l on l.user_id = au.id
left join ev          e on e.user_id = au.id
order by aktive_dage desc nulls last, logs desc nulls last;


-- ▼ 4) FEATURE-TRAGT — hvor mange DISTINKTE brugere har prøvet hver feature?
--    Viser hvad folk faktisk rører (og hvad ingen gider). % er af alle signups.
--    (Åbnet CV kræver 'resume_open'-eventet — kommer med næste app-build.)
select handling, brugere, round(100.0 * brugere / nullif((select count(*) from auth.users), 0)) as pct_af_signups
from (
            select 'Startet vagt'    handling, count(distinct user_id) brugere from app_events where event = 'shift_start'
  union all select 'Delt vagt-kort',          count(distinct user_id) from app_events where event = 'share_card'
  union all select 'Åbnet Vin',               count(distinct user_id) from app_events where event = 'tab' and meta->>'t' = 'vin'
  union all select 'Åbnet Feed',              count(distinct user_id) from app_events where event = 'tab' and meta->>'t' = 'feed'
  union all select 'Åbnet Lab',               count(distinct user_id) from app_events where event = 'tab' and meta->>'t' = 'lab'
  union all select 'Scannet vin',             count(distinct user_id) from app_events where event = 'wine_scan'
  union all select 'Åbnet CV',                count(distinct user_id) from app_events where event = 'resume_open'
  union all select 'Preview CV',              count(distinct user_id) from app_events where event = 'resume_preview'
  union all select 'Delt CV',                 count(distinct user_id) from app_events where event = 'resume_share'
  union all select 'Ramt paywall',            count(distinct user_id) from app_events where event = 'pro_wall'
) x
order by brugere desc;
