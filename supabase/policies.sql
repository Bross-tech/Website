-- policies.sql (row-level security basics)
-- Enable RLS where appropriate
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;

-- Profiles: user reads their own profile
CREATE POLICY IF NOT EXISTS "profiles_self_read" ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "profiles_self_modify" ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Admins (role='admin' in profiles) can manage profiles
CREATE POLICY IF NOT EXISTS "profiles_admin_manage" ON public.profiles FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Announcements: everyone can read
CREATE POLICY IF NOT EXISTS "announcements_public_read" ON public.announcements FOR SELECT USING (true);
-- Insert only admins
CREATE POLICY IF NOT EXISTS "announcements_admin_insert" ON public.announcements FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Orders: users can insert (place orders)
CREATE POLICY IF NOT EXISTS "orders_insert_by_user" ON public.orders FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can read their own orders
CREATE POLICY IF NOT EXISTS "orders_select_own" ON public.orders FOR SELECT
USING (user_id = auth.uid());

-- Admins can read/manage all orders
CREATE POLICY IF NOT EXISTS "orders_admin_manage" ON public.orders FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
