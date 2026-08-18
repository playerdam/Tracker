-- Craft-rating: fælles vin-katalog + ratings (Vivino-erstatning).
-- Kør i Supabase SQL Editor FØR du sætter WINE_RATINGS_ENABLED=1 på Railway.
-- Idempotent.

create table if not exists wine_catalog (
  id         uuid primary key default gen_random_uuid(),
  signature  text unique not null,   -- normaliseret producent+navn+årgang
  producer   text,
  name       text,
  vint       text,
  type       text,
  land       text,
  region     text,
  grape      text,
  image_url  text,
  created_at timestamptz default now()
);

create table if not exists wine_ratings (
  wine_id    uuid references wine_catalog(id) on delete cascade,
  user_id    uuid references users(id) on delete cascade,
  score      int not null check (score between 1 and 5),
  comment    text,
  updated_at timestamptz default now(),
  primary key (wine_id, user_id)
);
create index if not exists wine_ratings_wine_idx on wine_ratings(wine_id);

-- Kun service_role (serveren) rører tabellerne — RLS til som defense-in-depth.
alter table wine_catalog enable row level security;
alter table wine_ratings enable row level security;

-- ── VERIFY (read-only) ─────────────────────────────────────────────
-- Kør EFTER migrationen. Alle 4 rækker skal vise '✅ OK'.
with expected(objekt, tbl, col) as (values
  ('wine_catalog',            'wine_catalog', null),
  ('wine_catalog.signature',  'wine_catalog', 'signature'),
  ('wine_ratings',            'wine_ratings', null),
  ('wine_ratings.score',      'wine_ratings', 'score'))
select e.objekt,
  case when e.col is null then
    case when exists (select 1 from information_schema.tables
      where table_schema='public' and table_name=e.tbl) then '✅ OK' else '❌ MANGLER' end
  else
    case when exists (select 1 from information_schema.columns
      where table_schema='public' and table_name=e.tbl and column_name=e.col) then '✅ OK' else '❌ MANGLER' end
  end as status
from expected e order by e.objekt;
