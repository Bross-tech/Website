import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    // sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) return alert(error.message);

    // create profile
    // NOTE: supabase auth will later call server trigger — but we upsert profile here safely
    const userId = data.user?.id;
    if (userId) {
      await supabase.from("profiles").upsert({ id: userId, email, username, phone, role: "user" }).select();
    }

    alert("Signup complete. Check your email for confirmation");
    router.push("/login");
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Sign up</h2>
      <form onSubmit={handleSignup}>
        <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Sign up</button>
      </form>
    </div>
  );
}
