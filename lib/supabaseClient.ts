// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

// ✅ Client-side (browser) — safe to expose
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,      // Must start with NEXT_PUBLIC_
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!  // Must start with NEXT_PUBLIC_
);

// ✅ Server-side (Admin) — use service role key
// Use only in server-side code (getServerSideProps, API routes, etc.)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!      // NEVER expose to client
);
