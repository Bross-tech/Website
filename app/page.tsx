"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { supabase } from "@/lib/supabaseClient";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";
import BottomNav from "@/components/BottomNav"; // ✅ replaced Navbar
import Bundles from "@/components/Bundles";
import { CartProvider } from "@/context/CartContext";
// import CartWidget from "@/components/CartWidget"; // ❌ removed for now (caused error)

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
        return;
      }

      // fetch profile info
      const { data: profile } = await supabase
        .from("profiles")
        .select("role,wallet,username")
        .eq("id", currentUser.id)
        .single();

      const fullUser = { ...currentUser, ...profile };
      setUser(fullUser);
      setLoading(false);

      if (fullUser?.role === "admin") {
        router.push("/admin");
      }
    };

    fetchUser();

    // listen for auth state changes
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">
            {isLogin ? "Login to your account" : "Create a new account"}
          </h1>

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

          {isLogin ? <LoginForm /> : <SignupForm />}

          <p className="text-sm text-center text-gray-500 mt-4">
            {isLogin
              ? "Don't have an account? Click Sign Up above."
              : "Already have an account? Click Login above."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <CartProvider>
      <BottomNav
        userId={user?.id}
        username={user?.username}
        wallet={user?.wallet ?? 0}
        role={user?.role}
      />
      <main className="p-6">
        <Bundles />
      </main>
      {/* <CartWidget /> */}
    </CartProvider>
  );
}
