// pages/_app.tsx
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CartProvider } from "@/contexts/CartContext";   // ✅ singular
import Navbar from "@/components/Navbar";
import CartWidget from "@/components/CartWidget";        // ✅ updated widget
import "@/styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  const [userId, setUserId] = useState<string | null>(null);

  // Listen for login/logout changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    // Load initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <CartProvider>
      <Navbar />
      <Component {...pageProps} userId={userId} />
      <CartWidget userId={userId ?? ""} /> {/* ✅ Pass userId */}
    </CartProvider>
  );
        }
