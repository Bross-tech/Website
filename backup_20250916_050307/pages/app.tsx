import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AdminDashboard from "../components/AdminDashboard";
import { PurchaseAnalytics } from "../components/PurchaseAnalytics";

export default function AppPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };

    getUser();

    // Listen for login/logout changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h2>Welcome to DATA STORE 4GH ⚡</h2>
        <p>Please log in to access your dashboard.</p>
        <button
          onClick={async () => {
            const { error } = await supabase.auth.signInWithOtp({
              email: prompt("Enter your email to log in") || "",
            });
            if (error) alert(error.message);
            else alert("Check your email for a login link!");
          }}
          style={{
            background: "#2563eb",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Log In
        </button>
      </div>
    );
  }

  // If logged in → show dashboard
  return (
    <div>
      <AdminDashboard user={user} />
      <PurchaseAnalytics user={user} />
    </div>
  );
}

// Ensure page is dynamic (important for Vercel + Supabase)
export async function getServerSideProps() {
  return { props: {} };
}
