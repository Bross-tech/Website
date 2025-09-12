import { useState } from "react";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "signup", email, username, phone, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      alert(data.message);
      setEmail(""); setUsername(""); setPhone(""); setPassword("");
    } else {
      alert(data.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: "1px solid #ccc", padding: 20, borderRadius: 8 }}>
      <h3>Sign Up</h3>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
      <input type="text" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
      <button type="submit" disabled={loading}>{loading ? "Signing up..." : "Sign Up"}</button>
    </form>
  );
}
