/**
 * pages/reset-password.tsx
 * Request password reset by sending a magic link / reset email.
 */
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/profile' });
    setLoading(false);
    if (error) alert(error.message);
    else alert("Check your email for a password reset link.");
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", textAlign: "center" }}>
      <h2>Reset password</h2>
      <form onSubmit={handleReset} style={{ display: "grid", gap: 8 }}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? "Sending…" : "Send reset email"}</button>
      </form>
    </div>
  );
}
