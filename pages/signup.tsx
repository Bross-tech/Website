import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referrerId, setReferrerId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (router.query.ref && typeof router.query.ref === "string") {
      setReferrerId(router.query.ref);
    }
  }, [router.query.ref]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      alert(authError.message);
      return;
    }

    if (authData.user) {
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
