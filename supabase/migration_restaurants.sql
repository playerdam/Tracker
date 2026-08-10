-- Restauranter = verificerede hold. Udvider teams-tabellen.
-- Kør i Supabase SQL Editor FØR du sætter RESTAURANTS_ENABLED=1 på Railway.
-- Idempotent (kan køres igen).
alter table teams add column if not exists kind        text default 'crew';   -- 'crew' | 'restaurant'
alter table teams add column if not exists status      text default 'active'; -- crew: 'active' · restaurant: 'pending'|'verified'
alter table teams add column if not exists city        text;
alter table teams add column if not exists verified_at timestamptz;
alter table teams add column if not exists note        text;                  -- valgfri note/link til verifikation

create index if not exists teams_kind_status_idx on teams(kind, status);
