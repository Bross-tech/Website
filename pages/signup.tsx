/**
 * pages/signup.tsx
 * Sign up with email + password + username + phone (creates profiles row).
 */
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // create auth user
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      return alert(error.message);
    }

    // create profile row using anon client; if you require service_role usage, do it server-side.
    // We assume RLS allows insert on profiles for auth.uid() via Supabase auth trigger.
    // If profile row must be inserted now, use supabase.from('profiles').insert(...)
    const userId = data.user?.id;
    if (userId) {
      await supabase.from("profiles").upsert({ id: userId, email, username, phone, role: "user" });
    }

    setLoading(false);
    alert("Signup success. Check your email for confirmation if required.");
    router.push("/login");
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", textAlign: "center" }}>
      <h2>Create account</h2>
      <form onSubmit={handleSignup} style={{ display: "grid", gap: 8 }}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button type="submit" disabled={loading}>{loading ? "Creating…" : "Create account"}</button>
      </form>
    </div>
  );
}
