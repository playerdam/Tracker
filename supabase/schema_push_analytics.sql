-- Push-notifikationer, Pro-venteliste og produktanalytik.
-- Kør i Supabase SQL Editor.

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
create index if not exists app_events_time_idx on app_events(created_at desc);
create index if not exists app_events_event_idx on app_events(event, created_at desc);

alter table push_subs enable row level security;
alter table pro_waitlist enable row level security;
alter table app_events enable row level security;
