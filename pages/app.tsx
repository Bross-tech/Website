/**
 * pages/app.tsx
 * Auth-aware landing page: shows login prompt if not logged in,
 * or appropriate dashboard if logged in (admin / user).
 */
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AdminDashboard from "../components/AdminDashboard";
import dynamic from "next/dynamic";

const UserDashboard = dynamic(() => import("./UserDashboard"), { ssr: false });

export default function AppPage() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);

      if (data.user) {
        const { data: prof } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
        setRole(prof?.role ?? "user");
      }
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: prof } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
        setRole(prof?.role ?? "user");
      } else setRole(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) return <p>Loading…</p>;

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <h1>Welcome to DATA STORE 4GH ⚡</h1>
        <p>Please log in or sign up to continue.</p>
        <div style={{ marginTop: 16 }}>
          <a href="/login">Log in</a> · <a href="/signup">Sign up</a>
        </div>
      </div>
    );
  }

  // Render dashboard based on role
  if (role === "admin") return <AdminDashboard user={user} />;
  return <UserDashboard />;
}

// ensure dynamic server rendering behaviour
export async function getServerSideProps() {
  return { props: {} };
}
