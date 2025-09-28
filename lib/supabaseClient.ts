// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

// ✅ Client-side (browser) — safe to expose
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,      
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!  
);

// ✅ Server-side (Admin) — use service role key
// Use only in server-side code (getServerSideProps, API routes, etc.)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,       // FIX: use NEXT_PUBLIC_ instead of SUPABASE_URL
  process.env.SUPABASE_SERVICE_ROLE_KEY!       // never expose to client
);
