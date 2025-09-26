import { createClient } from "@supabase/supabase-js";

// Client-side (browser) — safe to expose
export const supabase = createClient(
  process.env.SUPABASE_URL!,        // no NEXT_PUBLIC_ needed here
  process.env.SUPABASE_ANON_KEY!    // safe anon key
);

// Server-side only — use service role key
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // ⚠️ never expose to client
);
