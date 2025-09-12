import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Insert additional info in "profiles" table
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ id: data.user?.id, username, phone }]);

      if (profileError) throw profileError;

      setMessage("Signup successful! Please check your email to confirm.");
      setEmail("");
      setUsername("");
      setPhone("");
      setPassword("");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <h3>Sign Up</h3>
      {message && <p>{message}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="tel"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Signing Up..." : "Sign Up"}
      </button>
    </form>
  );
}
