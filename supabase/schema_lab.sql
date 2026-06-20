-- Craft Tracker: The Lab schema
-- Kør dette i Supabase SQL Editor

create table if not exists lab_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users(id) on delete cascade,
  image_url  text not null,
  analysis   jsonb not null,
  created_at timestamptz default now()
);

create index if not exists lab_entries_user_idx on lab_entries(user_id, created_at desc);

-- Supabase Storage bucket til lab-billeder (kør i Storage > New bucket)
-- Navn: lab-photos, Public: true
