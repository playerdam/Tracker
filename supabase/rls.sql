-- Craft Tracker: Row Level Security
-- Kør dette i Supabase SQL Editor

-- Slå RLS til på alle tabeller
alter table users enable row level security;
alter table log_entries enable row level security;
alter table lab_entries enable row level security;
alter table follows enable row level security;
alter table likes enable row level security;
alter table comments enable row level security;
alter table categories enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;

-- Service role bypasser altid RLS (Railway-serveren bruger service role)
-- Policies nedenfor gælder kun hvis nogen tilgår Supabase direkte med anon/user token

-- users: kun sig selv
create policy "users: læs egen" on users for select using (id = auth.uid());
create policy "users: opdater egen" on users for update using (id = auth.uid());
create policy "users: opret egen" on users for insert with check (id = auth.uid());

-- log_entries: læs offentlige + egne, skriv kun egne
create policy "log_entries: læs offentlige" on log_entries for select using (is_public = true or user_id = auth.uid());
create policy "log_entries: skriv egne" on log_entries for insert with check (user_id = auth.uid());
create policy "log_entries: slet egne" on log_entries for delete using (user_id = auth.uid());

-- lab_entries: kun egne
create policy "lab_entries: læs egne" on lab_entries for select using (user_id = auth.uid());
create policy "lab_entries: skriv egne" on lab_entries for insert with check (user_id = auth.uid());
create policy "lab_entries: slet egne" on lab_entries for delete using (user_id = auth.uid());

-- follows: læs egne relationer
create policy "follows: læs egne" on follows for select using (follower_id = auth.uid() or following_id = auth.uid());
create policy "follows: opret" on follows for insert with check (follower_id = auth.uid());
create policy "follows: slet egne" on follows for delete using (follower_id = auth.uid());

-- likes: læs alle, skriv egne
create policy "likes: læs alle" on likes for select using (true);
create policy "likes: skriv egne" on likes for insert with check (user_id = auth.uid());
create policy "likes: slet egne" on likes for delete using (user_id = auth.uid());

-- comments: læs alle, skriv egne
create policy "comments: læs alle" on comments for select using (true);
create policy "comments: skriv egne" on comments for insert with check (user_id = auth.uid());
create policy "comments: slet egne" on comments for delete using (user_id = auth.uid());

-- categories: alle må læse, ingen må skrive direkte
create policy "categories: læs alle" on categories for select using (true);

-- teams: alle må læse teams de er med i
create policy "teams: læs egne" on teams for select using (
  id in (select team_id from team_members where user_id = auth.uid())
  or created_by = auth.uid()
);
create policy "teams: opret" on teams for insert with check (created_by = auth.uid());

-- team_members: læs sit eget team
create policy "team_members: læs egne" on team_members for select using (
  team_id in (select team_id from team_members where user_id = auth.uid())
);
create policy "team_members: join" on team_members for insert with check (user_id = auth.uid());
create policy "team_members: forlad" on team_members for delete using (user_id = auth.uid());
