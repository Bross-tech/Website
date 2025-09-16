/**
 * pages/profile.tsx
 * Simple profile page: allows username & phone update and change password via Supabase
 */
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return setLoading(false);
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
      setProfile(prof);
      setUsername(prof?.username ?? "");
      setPhone(prof?.phone ?? "");
      setLoading(false);
    })();
  }, []);

  if (loading) return <p>Loading…</p>;
  if (!profile) return <p>Please login to view profile.</p>;

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("profiles").update({ username, phone }).eq("id", profile.id);
    setLoading(false);
    if (error) alert("Update failed: " + error.message);
    else alert("Profile updated");
  }

  async function changePassword() {
    const newPassword = prompt("Enter new password (min length depends on your Supabase settings)");
    if (!newPassword) return;
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert(error.message);
    else alert("Password updated");
  }

  return (
    <div style={{ maxWidth: 560, margin: "32px auto" }}>
      <h2>Account</h2>
      <form onSubmit={updateProfile} style={{ display: "grid", gap: 8 }}>
        <input value={profile.email ?? ""} disabled />
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit">Save</button>
          <button onClick={(e) => { e.preventDefault(); changePassword(); }}>Change password</button>
        </div>
      </form>
    </div>
  );
}
