-- ════════════════════════════════════════════════════════════════════════
--  CRAFT TRACKER — FULD DATABASE-OPSÆTNING (fra bunden)
--  Kør HELE denne fil i Supabase SQL Editor. Erstatter de 12 fragmenterede
--  migration-filer som ét samlet, korrekt-ordnet script.
--
--  Idempotent: 'if not exists' overalt. Sikker at køre igen.
--  Til en FRISK/renset database — se WIPE-blokken nedenfor.
-- ════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────
--  0) WIPE — ryd al eksisterende app-data + tabeller.
--     ⚠️  SLETTER ALT i public-skemaet. Fjern kommentar-blokken for at køre.
--     Rører IKKE auth.users (login-konti) eller storage (billeder) — se noter
--     nederst hvis du også vil rydde dem.
-- ─────────────────────────────────────────────────────────────────────────
-- drop table if exists
--   app_events, pro_waitlist, push_subs,
--   lab_dishes, lab_entries,
--   team_members, teams,
--   comments, likes, follows,
--   user_state, log_entries, categories, users
-- cascade;


-- ─────────────────────────────────────────────────────────────────────────
--  1) KERNE
-- ─────────────────────────────────────────────────────────────────────────

-- Profil-række pr. auth-bruger. id ER auth.users.id (Supabase-profil-mønster).
create table if not exists users (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text unique,
  nickname   text,
  profession text,
  workplace  text,
  pro_until  timestamptz,   -- Pro-abonnement udløber her; NULL = gratis-bruger
  created_at timestamptz default now()
);
create index if not exists users_username_lower_idx on users(lower(username));

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
  is_public   boolean not null default true,
  summary     text,
  image_url   text,
  logged_at   timestamptz default now()
);

-- Fuld backup af klient-state (tællere, vine, vagthistorik) pr. bruger.
create table if not exists user_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);


-- ─────────────────────────────────────────────────────────────────────────
--  2) SOCIAL (feed, følg, likes, kommentarer)
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists follows (
  follower_id  uuid references users(id) on delete cascade,
  following_id uuid references users(id) on delete cascade,
  status       text not null default 'accepted' check (status in ('pending', 'accepted')),
  created_at   timestamptz default now(),
  primary key (follower_id, following_id)
);
create index if not exists follows_following_idx on follows(following_id);
create index if not exists follows_pending_idx on follows(following_id) where status = 'pending';

create table if not exists likes (
  user_id    uuid references users(id) on delete cascade,
  entry_id   uuid references log_entries(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, entry_id)
);
create index if not exists likes_entry_idx on likes(entry_id);

create table if not exists comments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users(id) on delete cascade,
  entry_id   uuid references log_entries(id) on delete cascade,
  text       text not null check (char_length(text) <= 280),
  created_at timestamptz default now()
);
create index if not exists comments_entry_idx on comments(entry_id);


-- ─────────────────────────────────────────────────────────────────────────
--  3) HOLD
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists teams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  invite_code text unique not null,
  created_by  uuid references users(id) on delete set null,
  created_at  timestamptz default now()
);

create table if not exists team_members (
  user_id   uuid references users(id) on delete cascade,
  team_id   uuid references teams(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (user_id, team_id)
);


-- ─────────────────────────────────────────────────────────────────────────
--  4) THE LAB
-- ─────────────────────────────────────────────────────────────────────────

-- Billed-analyse-indgange
create table if not exists lab_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users(id) on delete cascade,
  image_url  text not null,
  analysis   jsonb not null,
  created_at timestamptz default now()
);
create index if not exists lab_entries_user_idx on lab_entries(user_id, created_at desc);

-- Retter (Køkkenet + Kogebogen). user_id er uuid+FK (konsistent med resten).
create table if not exists lab_dishes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users(id) on delete cascade,
  name       text not null default 'Ny ret',
  status     text not null default 'idea',
  hero_url   text,
  data       jsonb not null default '{}'::jsonb,
  visibility text not null default 'private',
  team_id    uuid references teams(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists lab_dishes_user_idx on lab_dishes(user_id, updated_at desc);
create index if not exists lab_dishes_team_idx on lab_dishes(team_id) where visibility in ('team','public');
create index if not exists lab_dishes_public_idx on lab_dishes(user_id) where visibility = 'public';


-- ─────────────────────────────────────────────────────────────────────────
--  5) PUSH / ANALYTIK / PRO-VENTELISTE
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists push_subs (
  endpoint   text primary key,
  user_id    uuid not null references users(id) on delete cascade,
  keys       jsonb not null,
  created_at timestamptz default now()
);
create index if not exists push_subs_user_idx on push_subs(user_id);

create table if not exists pro_waitlist (
  user_id    uuid primary key references users(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists app_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users(id) on delete set null,
  event      text not null,
  meta       jsonb,
  created_at timestamptz default now()
);
create index if not exists app_events_time_idx  on app_events(created_at desc);
create index if not exists app_events_event_idx on app_events(event, created_at desc);


-- ─────────────────────────────────────────────────────────────────────────
--  6) SEED — standard-kategorier
-- ─────────────────────────────────────────────────────────────────────────
insert into categories (label_da, label_en, is_default) values
  ('Østers åbnet',       'Oysters opened',  true),
  ('Løg snittet',        'Onions cut',      true),
  ('Flasker åbnet',      'Bottles opened',  true),
  ('Couverter serveret', 'Covers served',   true)
on conflict (label_da) do nothing;


-- ─────────────────────────────────────────────────────────────────────────
--  7) ROW LEVEL SECURITY
--     Serveren bruger service-role og bypasser alt dette. Policies gælder kun
--     hvis nogen tilgår Supabase direkte med et bruger-token — defense-in-depth.
-- ─────────────────────────────────────────────────────────────────────────
alter table users        enable row level security;
alter table categories   enable row level security;
alter table log_entries  enable row level security;
alter table user_state   enable row level security;
alter table follows      enable row level security;
alter table likes        enable row level security;
alter table comments     enable row level security;
alter table teams        enable row level security;
alter table team_members enable row level security;
alter table lab_entries  enable row level security;
alter table lab_dishes   enable row level security;
alter table push_subs    enable row level security;
alter table pro_waitlist enable row level security;
alter table app_events   enable row level security;

-- users
drop policy if exists "users: læs egen"     on users;
create policy "users: læs egen"     on users for select using (id = auth.uid());
drop policy if exists "users: opdater egen" on users;
create policy "users: opdater egen" on users for update using (id = auth.uid());
drop policy if exists "users: opret egen"   on users;
create policy "users: opret egen"   on users for insert with check (id = auth.uid());

-- categories
drop policy if exists "categories: læs alle" on categories;
create policy "categories: læs alle" on categories for select using (true);

-- log_entries
drop policy if exists "log_entries: læs offentlige" on log_entries;
create policy "log_entries: læs offentlige" on log_entries for select using (is_public = true or user_id = auth.uid());
drop policy if exists "log_entries: skriv egne" on log_entries;
create policy "log_entries: skriv egne"     on log_entries for insert with check (user_id = auth.uid());
drop policy if exists "log_entries: slet egne" on log_entries;
create policy "log_entries: slet egne"      on log_entries for delete using (user_id = auth.uid());

-- follows
drop policy if exists "follows: læs egne" on follows;
create policy "follows: læs egne"  on follows for select using (follower_id = auth.uid() or following_id = auth.uid());
drop policy if exists "follows: opret" on follows;
create policy "follows: opret"     on follows for insert with check (follower_id = auth.uid());
drop policy if exists "follows: slet egne" on follows;
create policy "follows: slet egne" on follows for delete using (follower_id = auth.uid());

-- likes
drop policy if exists "likes: læs alle" on likes;
create policy "likes: læs alle"   on likes for select using (true);
drop policy if exists "likes: skriv egne" on likes;
create policy "likes: skriv egne" on likes for insert with check (user_id = auth.uid());
drop policy if exists "likes: slet egne" on likes;
create policy "likes: slet egne"  on likes for delete using (user_id = auth.uid());

-- comments
drop policy if exists "comments: læs alle" on comments;
create policy "comments: læs alle"   on comments for select using (true);
drop policy if exists "comments: skriv egne" on comments;
create policy "comments: skriv egne" on comments for insert with check (user_id = auth.uid());
drop policy if exists "comments: slet egne" on comments;
create policy "comments: slet egne"  on comments for delete using (user_id = auth.uid());

-- teams
drop policy if exists "teams: læs egne" on teams;
create policy "teams: læs egne" on teams for select using (
  id in (select team_id from team_members where user_id = auth.uid()) or created_by = auth.uid());
drop policy if exists "teams: opret" on teams;
create policy "teams: opret" on teams for insert with check (created_by = auth.uid());

-- team_members
drop policy if exists "team_members: læs egne" on team_members;
create policy "team_members: læs egne" on team_members for select using (
  team_id in (select team_id from team_members where user_id = auth.uid()));
drop policy if exists "team_members: join" on team_members;
create policy "team_members: join"   on team_members for insert with check (user_id = auth.uid());
drop policy if exists "team_members: forlad" on team_members;
create policy "team_members: forlad" on team_members for delete using (user_id = auth.uid());

-- lab_entries
drop policy if exists "lab_entries: læs egne" on lab_entries;
create policy "lab_entries: læs egne"   on lab_entries for select using (user_id = auth.uid());
drop policy if exists "lab_entries: skriv egne" on lab_entries;
create policy "lab_entries: skriv egne" on lab_entries for insert with check (user_id = auth.uid());
drop policy if exists "lab_entries: slet egne" on lab_entries;
create policy "lab_entries: slet egne"  on lab_entries for delete using (user_id = auth.uid());

-- lab_dishes
drop policy if exists "lab_dishes: læs egne" on lab_dishes;
create policy "lab_dishes: læs egne"    on lab_dishes for select using (user_id = auth.uid());
drop policy if exists "lab_dishes: skriv egne" on lab_dishes;
create policy "lab_dishes: skriv egne"  on lab_dishes for insert with check (user_id = auth.uid());
drop policy if exists "lab_dishes: opdater egne" on lab_dishes;
create policy "lab_dishes: opdater egne" on lab_dishes for update using (user_id = auth.uid());
drop policy if exists "lab_dishes: slet egne" on lab_dishes;
create policy "lab_dishes: slet egne"   on lab_dishes for delete using (user_id = auth.uid());


-- ─────────────────────────────────────────────────────────────────────────
--  8) STORAGE-BUCKETS (til billeder). Begge skal være public.
-- ─────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public) values
  ('log-photos', 'log-photos', true),
  ('lab-photos', 'lab-photos', true)
on conflict (id) do update set public = true;


-- ════════════════════════════════════════════════════════════════════════
--  NOTER:
--  • Vil du OGSÅ rydde test-login-konti: Supabase Dashboard → Authentication
--    → Users → slet dem (eller: delete from auth.users;). users-rækkerne
--    forsvinder automatisk (on delete cascade).
--  • Gamle billeder i storage bliver ikke slettet af scriptet — ryd evt.
--    bucket-indholdet i Dashboard → Storage hvis du vil have det helt rent.
-- ════════════════════════════════════════════════════════════════════════
