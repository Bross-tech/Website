"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Bundles from "@/components/Bundles";
import CartWidget from "@/components/CartWidget";
import { CartProvider } from "@/contexts/CartContext";
import { createBrowserSupabaseClient } from "@supabase/ssr";

export default function HomePage() {
  // Create Supabase client
  const supabase = createBrowserSupabaseClient();

  // Track user state
  const [user, setUser] = useState<any>(null);

  // Fetch the current user on mount
  useEffect(() => {
    supabase.auth.getUser().then((res) => setUser(res.data.user));

    // Listen to auth state changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Cleanup listener on unmount
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <CartProvider>
      <Navbar user={user} />
      <main style={{ padding: 16 }}>
        <Bundles />
      </main>
      <CartWidget />
    </CartProvider>
  );
}
