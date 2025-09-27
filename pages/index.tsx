"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import Bundles from "@/components/Bundles";
import CartWidget from "@/components/CartWidget";
import { CartProvider } from "@/context/CartContext";
import { supabase } from "@/lib/supabaseClient";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data.user;

      if (!currentUser) {
        router.push("/login");
        return;
      }

      // Fetch profile info
      const { data: profile } = await supabase
        .from("profiles")
        .select("role,wallet")
        .eq("id", currentUser.id)
        .single();

      setUser({ ...currentUser, ...profile });
      setLoading(false);
    };

    fetchUser();

    // Subscribe to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (!currentUser) router.push("/login");
    });

    return () => listener?.subscription?.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  // Redirect admins to admin dashboard
  if (user?.role === "admin") {
    router.push("/admin");
    return null;
  }

  return (
    <CartProvider>
      <Navbar userId={user?.id} role={user?.role} wallet={user?.wallet ?? 0} />
      <main className="p-6">
        <Bundles />
      </main>
      <CartWidget />
    </CartProvider>
  );
}
