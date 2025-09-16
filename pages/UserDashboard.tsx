/**
 * pages/UserDashboard.tsx
 * Simple user dashboard. Extend as needed.
 */
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function UserDashboard() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
      setProfile(prof);
    };
    fetch();
  }, []);

  if (!profile) return <p>Loading profile…</p>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Welcome, {profile.username ?? profile.email}</h2>
      <p>Role: {profile.role ?? "user"}</p>
      <p>Phone: {profile.phone ?? "not provided"}</p>
      {/* add wallet / purchases / etc */}
    </div>
  );
}
