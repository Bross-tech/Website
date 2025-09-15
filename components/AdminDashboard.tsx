import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function AdminDashboard({ user }) {
  const [users, setUsers] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementMsg, setAnnouncementMsg] = useState("");

  // Fetch users + announcements on mount
  useEffect(() => {
    const fetchData = async () => {
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("id, email, role");

      if (usersError) console.error(usersError);
      else setUsers(usersData || []);

      const { data: annData, error: annError } = await supabase
        .from("announcements")
        .select("*")
        .order("date", { ascending: false });

      if (annError) console.error(annError);
      else setAnnouncements(annData || []);
    };

    fetchData();
  }, []);

  // Block / Unblock users
  const updateUserRole = async (id: string, role: string) => {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (error) {
      console.error(error);
      return;
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role } : u))
    );
  };

  // Send announcement
  const sendAnnouncement = async () => {
    if (!announcementMsg.trim()) return;
    const { data, error } = await supabase
      .from("announcements")
      .insert([
        {
          admin_id: user.id,
          message: announcementMsg,
          date: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setAnnouncements((prev) => [data, ...prev]); // prepend new announcement
    setAnnouncementMsg("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>⚡ Admin Dashboard</h2>

      {/* Users Management */}
      <div style={{ marginTop: "20px" }}>
        <h3>👥 Manage Users</h3>
        <ul>
          {users.map((u) => (
            <li key={u.id}>
              {u.email} ({u.role})
              {u.role === "blocked" ? (
                <button onClick={() => updateUserRole(u.id, "user")}>
                  Unblock
                </button>
              ) : (
                <button onClick={() => updateUserRole(u.id, "blocked")}>
                  Block
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Announcements */}
      <div style={{ marginTop: "20px" }}>
        <h3>📢 Announcements</h3>
        <textarea
          value={announcementMsg}
          onChange={(e) => setAnnouncementMsg(e.target.value)}
          placeholder="Type a message..."
          style={{ width: "100%", minHeight: "80px", marginBottom: "10px" }}
        />
        <br />
        <button onClick={sendAnnouncement}>Send Announcement</button>
        <ul>
          {announcements.map((a) => (
            <li key={a.id}>
              <strong>{new Date(a.date).toLocaleString()}:</strong> {a.message}
            </li>
          ))}
        </ul>
      </div>

      {/* TODO: File manager, approval queue, purchase reversal, etc. */}
    </div>
  );
}
