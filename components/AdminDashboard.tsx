"use client";

import type { User as SupabaseUser } from "@supabase/supabase-js";

interface AdminDashboardProps {
  user: SupabaseUser;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  return (
    <div>
      <h2>Welcome, {user.email ?? "Unknown"}</h2>
    </div>
  );
}
