"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Bundles from "@/components/Bundles";
import CartWidget from "@/components/CartWidget";
import { CartProvider } from "@/context/CartContext"; // make sure this is singular 'context'
import { supabase } from "@/lib/supabaseClient"; // use the browser-safe client

export default function HomePage() {
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
