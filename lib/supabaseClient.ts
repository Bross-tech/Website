/**
 * lib/supabaseClient.ts
 * Exports two clients:
 *  - supabase: client for frontend (anon key)
 *  - supabaseAdmin: server-side client (service_role key)
 *
 * Make sure your env:
 * NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Frontend client (safe to use in browser)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin/server client (use only in server-side code)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
