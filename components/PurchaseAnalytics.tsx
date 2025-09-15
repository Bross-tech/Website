"use client";

import type { User as SupabaseUser } from "@supabase/supabase-js";

interface PurchaseAnalyticsProps {
  user?: SupabaseUser;
}

export function PurchaseAnalytics({ user }: PurchaseAnalyticsProps) {
  if (!user) return <div>No user data available.</div>;

  return (
    <div>
      <h2>Analytics for {user.email ?? "Unknown"}</h2>
    </div>
  );
}
