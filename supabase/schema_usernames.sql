-- Craft Tracker: brugernavn + follow-anmodninger
-- Kør dette i Supabase SQL Editor

-- Unikt @-brugernavn (lowercase handle, fx @playerdam)
alter table users add column if not exists username text unique;
create index if not exists users_username_lower_idx on users(lower(username));

-- Status-kolonne på follows: eksisterende rækker er 'accepted', nye er 'pending'
alter table follows add column if not exists status text not null default 'accepted' check (status in ('pending', 'accepted'));

-- Indeks til at finde afventende anmodninger hurtigt
create index if not exists follows_pending_idx on follows(following_id) where status = 'pending';
