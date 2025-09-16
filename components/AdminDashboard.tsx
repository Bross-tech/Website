/**
 * components/AdminDashboard.tsx
 * A self-contained admin panel component.
 * Expects a `user` prop with { id, email } (from Supabase).
 *
 * Features:
 *  - List profiles (id, email, username, role, phone)
 *  - Block / Unblock user (role update)
 *  - Announcements CRUD (admin only)
 *  - Basic UI; extend as needed
 */
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Profile = {
  id: string;
  email?: string;
  username?: string;
  role?: string;
  phone?: string;
};

export default function AdminDashboard({ user }: { user: any }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    // profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, username, role, phone")
      .order("created_at", { ascending: false });

    if (profilesError) console.error("profiles:", profilesError);
    else setProfiles(profilesData ?? []);

    // announcements
    const { data: annData, error: annError } = await supabase
      .from("announcements")
      .select("*")
      .order("date", { ascending: false });

    if (annError) console.error("ann:", annError);
    else setAnnouncements(annData ?? []);
  }

  async function updateRole(id: string, newRole: string) {
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", id);
    if (error) return alert("Failed to update role: " + error.message);
    setProfiles((p) => p.map((x) => (x.id === id ? { ...x, role: newRole } : x)));
  }

  async function sendAnnouncement() {
    if (!msg.trim()) return;
    const { data, error } = await supabase
      .from("announcements")
      .insert([{ admin_id: user.id, message: msg, date: new Date().toISOString() }])
      .select()
      .single();
    if (error) return alert("Announcement failed: " + error.message);
    setAnnouncements((s) => [data, ...s]);
    setMsg("");
  }

  return (
    <section style={{ padding: 16 }}>
      <h2>Admin Dashboard</h2>

      <section style={{ marginTop: 16 }}>
        <h3>Manage Users</h3>
        <ul>
          {profiles.map((p) => (
            <li key={p.id} style={{ marginBottom: 8 }}>
              <strong>{p.email ?? p.username ?? p.id}</strong> — {p.role ?? "user"}{" "}
              {p.role !== "blocked" ? (
                <button onClick={() => updateRole(p.id, "blocked")} style={{ marginLeft: 8 }}>
                  Block
                </button>
              ) : (
                <button onClick={() => updateRole(p.id, "user")} style={{ marginLeft: 8 }}>
                  Unblock
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Announcements</h3>
        <textarea
          placeholder="Write announcement..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          style={{ width: "100%", minHeight: 80 }}
        />
        <div style={{ marginTop: 8 }}>
          <button onClick={sendAnnouncement}>Send</button>
        </div>
        <ul style={{ marginTop: 12 }}>
          {announcements.map((a) => (
            <li key={a.id}>
              <strong>{new Date(a.date).toLocaleString()}:</strong> {a.message}
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
