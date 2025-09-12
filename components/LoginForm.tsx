import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return setMessage("Email and password required");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setMessage(error.message); setLoading(false); return; }

    const { data: userData } = await supabase.from("users").select("phone, username").eq("id", data.user?.id).single();
    if (userData?.phone) {
      await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: userData.phone, message: `Hello ${userData.username || email}, you logged in successfully!` }),
      });
    }

    setMessage("Login successful! Check your SMS.");
    setLoading(false);
  };

  return (
    <div>
      <h2>Login</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin} disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      {message && <div>{message}</div>}
    </div>
  );
}
