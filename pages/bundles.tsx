// pages/bundles.tsx
"use client";

import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import Bundles from "@/components/Bundles";
import Navbar from "@/components/Navbar";
import WhatsAppSupport from "@/components/WhatsAppSupport";
import CartWidget from "@/components/CartWidget";
import BottomNav from "@/components/BottomNav"; // ✅ imported
import toast from "react-hot-toast";

export default function BundlesPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<{
    id: string;
    role: string; // keep as string
    wallet: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user:", userError);
        setLoading(false);
        return;
      }

      if (!user) {
        toast.error("You must log in to continue."); // notify
        router.push("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, wallet")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setLoading(false);
        return;
      }

      if (profile) setUserData(profile);
      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Available Bundles</title>
      </Head>

      {userData && (
        <Navbar
          userId={userData.id}
          role={userData.role as "agent" | "admin" | "customer"} // ✅ patched
          wallet={userData.wallet}
        />
      )}

      <main className="p-6">
        <Bundles />
        <CartWidget />
        <WhatsAppSupport />
      </main>

      {/* ✅ BottomNav fixed at bottom */}
      <BottomNav />
    </>
  );
}
