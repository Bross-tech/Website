/**
 * pages/login.tsx
 * Email + password login and magic link (OTP) support.
 */
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) alert(error.message);
    else alert("Check your email for a login link.");
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) alert(error.message);
    else router.push("/app");
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", textAlign: "center" }}>
      <h2>Log in</h2>
      <form onSubmit={handlePasswordLogin} style={{ display: "grid", gap: 8 }}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <button type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in (password)"}</button>
          <button onClick={handleEmailLogin} type="button" disabled={loading}>{loading ? "…" : "Send magic link"}</button>
        </div>
      </form>
      <p style={{ marginTop: 12 }}>
        <Link href="/signup">Create account</Link> · <Link href="/reset-password">Forgot password</Link>
      </p>
    </div>
  );
}
