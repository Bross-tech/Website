import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !username || !phone || !password) return setMessage("All fields are required");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, phone } },
    });

    if (error) { setMessage(error.message); setLoading(false); return; }

    try {
      await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, message: `Welcome ${username}! Your account was created.` }),
      });
    } catch (err) { console.error("SMS error:", err); }

    setMessage("Signup successful! Check your SMS.");
    setLoading(false);
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input placeholder="Phone (+254...)" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleSignup} disabled={loading}>{loading ? "Signing up..." : "Sign Up"}</button>
      {message && <div>{message}</div>}
    </div>
  );
}
