-- The Lab: deling af retter (Køkkenet + Kogebogen)
-- Kør i Supabase SQL Editor.
alter table lab_dishes add column if not exists visibility text not null default 'private';
alter table lab_dishes add column if not exists team_id uuid references teams(id) on delete set null;
create index if not exists lab_dishes_team_idx on lab_dishes(team_id) where visibility in ('team','public');
create index if not exists lab_dishes_public_idx on lab_dishes(user_id) where visibility = 'public';
