-- Craft Track: social feed schema
-- Kør dette i Supabase SQL Editor

-- Gør log_entries offentlige som standard
alter table log_entries add column if not exists is_public boolean not null default true;

-- Gem en tekst-opsummering så feedet kan vise hvad der blev logget
alter table log_entries add column if not exists summary text;

-- Følg-relation
create table if not exists follows (
  follower_id  uuid references users(id) on delete cascade,
  following_id uuid references users(id) on delete cascade,
  created_at   timestamptz default now(),
  primary key (follower_id, following_id)
);

-- Likes
create table if not exists likes (
  user_id      uuid references users(id) on delete cascade,
  entry_id     uuid references log_entries(id) on delete cascade,
  created_at   timestamptz default now(),
  primary key (user_id, entry_id)
);

-- Kommentarer
create table if not exists comments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users(id) on delete cascade,
  entry_id   uuid references log_entries(id) on delete cascade,
  text       text not null check (char_length(text) <= 280),
  created_at timestamptz default now()
);

create index if not exists comments_entry_idx on comments(entry_id);
create index if not exists follows_following_idx on follows(following_id);
create index if not exists likes_entry_idx on likes(entry_id);
