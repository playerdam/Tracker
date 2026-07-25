-- The Lab: retter (dishes) — base-tabellen
-- Kør i Supabase SQL Editor. SKAL køres FØR schema_lab_share.sql
-- (som tilføjer visibility + team_id til denne tabel).
--
-- Bemærk: denne migration manglede oprindeligt i repoet — tabellen blev
-- oprettet manuelt tidligt i udviklingen. Filen er her nu så en frisk
-- database kan bygges fra bunden. På en eksisterende DB er den et no-op.

create table if not exists lab_dishes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users(id) on delete cascade,
  name       text,
  status     text,
  hero_url   text,
  data       jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists lab_dishes_user_idx on lab_dishes(user_id, updated_at desc);

-- RLS (defense-in-depth — serveren bruger service role og bypasser dette,
-- og håndhæver selv delings-adgang. Klienten rører aldrig tabellen direkte).
-- Vi låser til egne rækker som sikker default.
alter table lab_dishes enable row level security;
create policy "lab_dishes: læs egne" on lab_dishes for select using (user_id = auth.uid());
create policy "lab_dishes: skriv egne" on lab_dishes for insert with check (user_id = auth.uid());
create policy "lab_dishes: opdater egne" on lab_dishes for update using (user_id = auth.uid());
create policy "lab_dishes: slet egne" on lab_dishes for delete using (user_id = auth.uid());
