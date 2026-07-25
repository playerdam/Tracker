-- ════════════════════════════════════════════════════════════════
-- MIGRATIONS-TJEK — read-only, sikker at køre.
-- Kør i Supabase SQL Editor. ❌ MANGLER = den migration mangler at blive kørt.
-- ════════════════════════════════════════════════════════════════
with expected(migration, tbl, col) as (
  values
    ('schema.sql',              'users',         null),
    ('schema.sql',              'categories',    null),
    ('schema.sql',              'log_entries',   null),
    ('schema_state.sql',        'user_state',    null),
    ('schema_social.sql',       'follows',       null),
    ('schema_social.sql',       'likes',         null),
    ('schema_social.sql',       'comments',      null),
    ('schema_social.sql',       'log_entries',   'is_public'),
    ('schema_social.sql',       'log_entries',   'summary'),
    ('schema_usernames.sql',    'users',         'username'),
    ('schema_usernames.sql',    'follows',       'status'),
    ('schema_workplace.sql',    'users',         'workplace'),
    ('schema_gamify.sql',       'teams',         null),
    ('schema_gamify.sql',       'team_members',  null),
    ('schema_gamify.sql',       'log_entries',   'image_url'),
    ('schema_lab.sql',          'lab_entries',   null),
    ('schema_lab_dishes.sql',   'lab_dishes',    null),
    ('schema_lab_share.sql',    'lab_dishes',    'visibility'),
    ('schema_lab_share.sql',    'lab_dishes',    'team_id'),
    ('schema_push_analytics.sql','push_subs',    null),
    ('schema_push_analytics.sql','pro_waitlist', null),
    ('schema_push_analytics.sql','app_events',   null)
)
select
  e.migration,
  e.tbl || coalesce('.' || e.col, '') as objekt,
  case
    when e.col is null then
      case when exists (
        select 1 from information_schema.tables t
        where t.table_schema = 'public' and t.table_name = e.tbl
      ) then '✅ OK' else '❌ MANGLER' end
    else
      case when exists (
        select 1 from information_schema.columns c
        where c.table_schema = 'public' and c.table_name = e.tbl and c.column_name = e.col
      ) then '✅ OK' else '❌ MANGLER' end
  end as status
from expected e
order by e.migration, objekt;
