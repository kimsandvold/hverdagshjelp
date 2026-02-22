-- Migration: Add profile_views table
-- Run this in Supabase SQL Editor

create table if not exists profile_views (
  id uuid primary key default gen_random_uuid(),
  helper_id uuid not null references helpers(id) on delete cascade,
  viewer_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists profile_views_helper_idx on profile_views (helper_id);

alter table profile_views enable row level security;

create policy "Anyone can insert views"
  on profile_views for insert with check (true);

create policy "Helpers can read own views"
  on profile_views for select using (helper_id = auth.uid());
