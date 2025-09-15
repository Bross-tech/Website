import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AdminDashboard from "../components/AdminDashboard";
import { PurchaseAnalytics } from "../components/PurchaseAnalytics";

export default function AppPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);

  // First effect: check auth user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  // Second effect: fetch user-related data if logged in
  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      const [roleRes, walletRes, purchasesRes] = await Promise.all([
        supabase.from("users").select("role").eq("id", user.id).single(),
        supabase.from("wallets").select("balance").eq("user_id", user.id).single(),
        supabase.from("purchases").select("*").eq("user_id", user.id),
      ]);

      console.log({ roleRes, walletRes, purchasesRes });
    };

    fetchUserData();
  }, [user]);

  return (
    <div>
      {user && <AdminDashboard user={user} />}
      {user && <PurchaseAnalytics user={user} />}
    </div>
  );
}
