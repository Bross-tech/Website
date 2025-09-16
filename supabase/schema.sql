-- schema.sql
-- Profiles table (separate from auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  email text,
  username text,
  phone text,
  role text DEFAULT 'user',
  wallet numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid,
  message text,
  date timestamptz
);

CREATE TABLE IF NOT EXISTS public.approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text,
  url text,
  uploaded_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bundles (
  id text PRIMARY KEY,
  network text,
  size text,
  price_agent numeric,
  price_customer numeric
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  recipient text,
  network text,
  size text,
  price numeric,
  status text DEFAULT 'pending', -- pending, processing, completed, failed
  created_at timestamptz DEFAULT now()
);
