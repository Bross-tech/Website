import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");

  const requestReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) alert(error.message); else alert("Reset link sent to email");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Reset password</h2>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button onClick={requestReset}>Send reset link</button>
    </div>
  );
}
