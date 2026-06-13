-- Migration: skift fra UUID+kode til Supabase Auth
-- Kør dette i Supabase SQL Editor

-- Fjern genopretningskode-kolonnen (bruges ikke længere)
alter table users drop column if exists code;

-- id leveres nu altid eksplicit fra Supabase Auth (auth.users.id)
-- default gen_random_uuid() er uskadelig — vi overskriver den altid
