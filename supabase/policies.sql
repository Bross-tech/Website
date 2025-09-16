-- supabase/policies.sql
-- Enables RLS and sensible policies for profiles and announcements

-- Enable RLS
alter table profiles enable row level security;
alter table announcements enable row level security;

-- PROFILES
-- Allow authenticated users to insert their own profile (auth.uid() must equal id)
create policy "Insert own profile" on profiles for insert
with check (auth.uid() = id);

-- Allow authenticated users to select their own profile
create policy "Select own profile" on profiles for select
using (auth.uid() = id);

-- Allow authenticated users to update their own profile (username/phone)
create policy "Update own profile" on profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Admins: allow full access for rows where profiles.role = 'admin'
create policy "Admins manage profiles" on profiles for all
using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ANNOUNCEMENTS
-- Everyone (authenticated) can read announcements
create policy "Select announcements" on announcements for select using (true);

-- Only admins can insert announcements
create policy "Admins insert announcements" on announcements for insert
with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Only admins can update/delete announcements
create policy "Admins update announcements" on announcements for update
using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admins delete announcements" on announcements for delete
using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
