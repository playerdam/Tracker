-- Arbejdsplads-felt til den nye signup-flow (Page 3 i mockup).
-- Kør i Supabase SQL Editor.
alter table users add column if not exists workplace text;
