-- Craft Track schema
-- Kør dette i Supabase SQL Editor

create table if not exists users (
  id         uuid primary key default gen_random_uuid(),
  code       text unique not null,
  nickname   text,
  profession text,
  created_at timestamptz default now()
);

create table if not exists categories (
  id         uuid primary key default gen_random_uuid(),
  label_da   text unique not null,
  label_en   text,
  is_default boolean default false,
  created_at timestamptz default now()
);

create table if not exists log_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references users(id) on delete cascade,
  category_id uuid references categories(id),
  delta       integer not null,
  logged_at   timestamptz default now()
);

-- Seed standard-kategorier
insert into categories (label_da, label_en, is_default) values
  ('Østers åbnet',       'Oysters opened',  true),
  ('Løg snittet',        'Onions cut',       true),
  ('Flasker åbnet',      'Bottles opened',   true),
  ('Couverter serveret', 'Covers served',    true)
on conflict (label_da) do nothing;
