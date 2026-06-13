-- Craft Track: gamification schema
-- Kør dette i Supabase SQL Editor

-- Foto-support på log-indgange
alter table log_entries add column if not exists image_url text;

-- Hold
create table if not exists teams (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  invite_code  text unique not null,
  created_by   uuid references users(id) on delete set null,
  created_at   timestamptz default now()
);

create table if not exists team_members (
  user_id   uuid references users(id) on delete cascade,
  team_id   uuid references teams(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (user_id, team_id)
);
