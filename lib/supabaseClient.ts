// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

// Make sure environment variables are defined
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for frontend (browser) — safe to expose
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin client (⚠️ only use in server-side code like API routes, NEVER in the browser)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
