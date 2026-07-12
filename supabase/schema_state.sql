-- Fuld backup af klient-state (tællere, vine, vagthistorik) pr. bruger.
-- Kør i Supabase SQL editor. Service-rollen skriver; RLS lukker alt andet.
create table if not exists user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table user_state enable row level security;
