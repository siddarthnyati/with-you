-- With You app schema
-- Run this in the Supabase SQL Editor at https://app.supabase.com

-- Phase 1: simple two-person setup
create table if not exists users (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  expo_push_token text,
  updated_at timestamptz default now()
);

-- Allow public read/write for Phase 1 (no auth required)
-- In Phase 2 you'd lock this down with Row Level Security + Auth
alter table users enable row level security;

create policy "Anyone can read users" on users
  for select using (true);

create policy "Anyone can insert/update users" on users
  for insert with check (true);

create policy "Anyone can update users" on users
  for update using (true);
