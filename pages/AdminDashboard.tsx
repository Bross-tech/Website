/**
 * pages/AdminDashboard.tsx
 * A simple page wrapper that requires server-side rendering (keeps dynamic)
 * This page can be protected via logic in _app or in getServerSideProps
 */
import React from "react";
import AdminDashboard from "../components/AdminDashboard";
import { supabase } from "../lib/supabaseClient";

export default function Page({ user }: { user: any }) {
  // user is fetched client-side in your /app page — here we accept prop optional
  return <AdminDashboard user={user} />;
}

// Optional: ensure page is not statically optimized
export async function getServerSideProps() {
  return { props: {} };
}
