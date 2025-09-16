import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface AdminDashboardProps {
  user: { id: string; email?: string; role?: string };
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [approvals, setApprovals] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);

  // Fetch users + announcements + approvals + files
  useEffect(() => {
    const fetchData = async () => {
      const { data: usersData } = await supabase.from("profiles").select("id, email, role");
      setUsers(usersData || []);

      const { data: annData } = await supabase
        .from("announcements")
        .select("*")
        .order("date", { ascending: false });
      setAnnouncements(annData || []);

      const { data: approvalsData } = await supabase.from("approvals").select("*");
      setApprovals(approvalsData || []);

      const { data: filesData } = await supabase.from("files").select("*");
      setFiles(filesData || []);
    };

    fetchData();
  }, []);

  // Update user role
  const updateUserRole = async (id: string, role: string) => {
    await supabase.from("profiles").update({ role }).eq("id", id);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  };

  // Send announcement
  const sendAnnouncement = async () => {
    if (!announcementMsg.trim()) return;
    const { data } = await supabase
      .from("announcements")
      .insert([{ admin_id: user.id, message: announcementMsg, date: new Date().toISOString() }])
      .select()
      .single();

    if (data) setAnnouncements((prev) => [data, ...prev]);
    setAnnouncementMsg("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>⚡ Admin Dashboard</h2>

      {/* Users */}
      <div style={{ marginTop: "20px" }}>
        <h3>👥 Manage Users</h3>
        <ul>
          {users.map((u) => (
            <li key={u.id}>
              {u.email} ({u.role})
              {u.role === "blocked" ? (
                <button onClick={() => updateUserRole(u.id, "user")}>Unblock</button>
              ) : (
                <button onClick={() => updateUserRole(u.id, "blocked")}>Block</button>
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

      {/* Approvals */}
      <div style={{ marginTop: "20px" }}>
        <h3>✅ Approvals</h3>
        <ul>
          {approvals.map((ap) => (
            <li key={ap.id}>{ap.description || "Approval item"}</li>
          ))}
        </ul>
      </div>

      {/* File Manager */}
      <div style={{ marginTop: "20px" }}>
        <h3>📂 File Manager</h3>
        <ul>
          {files.map((f) => (
            <li key={f.id}>{f.filename}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
