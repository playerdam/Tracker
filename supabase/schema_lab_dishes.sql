-- The Lab: retter (dishes) — base-tabellen
-- Kør i Supabase SQL Editor. SKAL køres FØR schema_lab_share.sql
-- (som tilføjer visibility + team_id til denne tabel).
--
-- Bemærk: denne migration manglede oprindeligt i repoet — tabellen blev
-- oprettet manuelt tidligt i udviklingen. Denne fil gengiver den tabel der
-- FAKTISK kører i produktion, så en frisk database bygges identisk. På en
-- eksisterende DB er den et no-op.
--
-- user_id er 'text' (ikke uuid/FK som resten af skemaet) — det er sådan den
-- blev oprettet, og det virker fint fordi serveren behandler user_id som en
-- opak streng fra JWT'en. Rør IKKE en eksisterende tabel for at "rette" dette.

create table if not exists lab_dishes (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,
  name       text not null default 'Ny ret',
  status     text not null default 'idea',
  hero_url   text,
  data       jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists lab_dishes_user_idx on lab_dishes(user_id, updated_at desc);

-- RLS (defense-in-depth — serveren bruger service role og bypasser dette,
-- og håndhæver selv delings-adgang. Klienten rører aldrig tabellen direkte).
alter table lab_dishes enable row level security;
create policy "users own their dishes" on lab_dishes
  for all using (user_id = auth.uid()::text);
