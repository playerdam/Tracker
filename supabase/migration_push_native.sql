-- Native iOS push (APNs): gemmer enheders device-tokens.
-- Kør i Supabase SQL Editor FØR du sætter APNS_*-variablerne på Railway.
-- Idempotent.
create table if not exists device_tokens (
  token      text primary key,
  user_id    uuid references users(id) on delete cascade,
  platform   text default 'ios',
  updated_at timestamptz default now()
);
create index if not exists device_tokens_user_idx on device_tokens(user_id);

alter table device_tokens enable row level security;
-- (Ingen policies → kun service_role på serveren rører den, ligesom push_subs.)
