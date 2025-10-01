"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // ✅ App Router navigation
import { supabase } from "@/lib/supabaseClient";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";
import Navbar from "@/components/Navbar";
import Bundles from "@/components/Bundles";
import CartWidget from "@/components/CartWidget";
import { CartProvider } from "@/context/CartContext";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data.user;

      if (!currentUser) {
        setLoading(false);
        return; // show login/signup
      }

      // Fetch profile info
      const { data: profile } = await supabase
        .from("profiles")
        .select("role,wallet")
        .eq("id", currentUser.id)
        .single();

      const fullUser = { ...currentUser, ...profile };
      setUser(fullUser);
      setLoading(false);

      // Redirect admins
      if (fullUser?.role === "admin") {
        router.push("/admin");
      }
    };

    fetchUser();

    // Subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      if (!currentUser) {
        setUser(null);
      } else {
        setUser(currentUser);
      }
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

  // ✅ If no user, show login/signup page
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">
            {isLogin ? "Login to your account" : "Create a new account"}
          </h1>

          {/* Toggle buttons */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`px-4 py-2 rounded ${
                isLogin ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`px-4 py-2 rounded ${
                !isLogin ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Forms */}
          {isLogin ? <LoginForm /> : <SignupForm />}

          {/* Small note */}
          <p className="text-sm text-center text-gray-500 mt-4">
            {isLogin
              ? "Don't have an account? Click Sign Up above."
              : "Already have an account? Click Login above."}
          </p>
        </div>
      </div>
    );
  }

  // ✅ If logged in (and not admin), show dashboard
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
