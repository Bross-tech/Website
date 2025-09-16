-- supabase/001_create_profiles.sql
-- Creates profiles and announcements tables used by the app
create table if not exists profiles (
  id uuid primary key,
  email text,
  username text,
  phone text,
  role text default 'user',
  created_at timestamptz default now()
);

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references profiles(id) on delete set null,
  message text,
  date timestamptz default now()
);
