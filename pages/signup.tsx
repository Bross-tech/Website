"use client"; // if using Next.js App Router, remove if on Pages Router

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referrerId, setReferrerId] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferrerId(ref);
    }
  }, [searchParams]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      alert(authError.message);
      return;
    }

    if (authData.user) {
      // Insert into users table with referrer
      const { error: dbError } = await supabase.from("users").insert([
        {
          id: authData.user.id,
          email,
          referrer_id: referrerId,
        },
      ]);

      if (dbError) {
        console.error("DB insert error:", dbError.message);
      }

      router.push("/dashboard");
    }
  };

  return (
    <form
      onSubmit={handleSignup}
      className="max-w-sm mx-auto p-6 border rounded-lg shadow bg-white dark:bg-gray-800"
    >
      <h2 className="text-xl font-bold mb-4">Sign Up</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-3 py-2 mb-3 border rounded"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-3 py-2 mb-3 border rounded"
        required
      />

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
      >
        Sign Up
      </button>
    </form>
  );
}
