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

  useEffect(() => {
    const fetchData = async () => {
      const { data: usersData } = await supabase.from("profiles").select("id, email, phone, role");
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

  const updateUserRole = async (id: string, role: string) => {
    await supabase.from("profiles").update({ role }).eq("id", id);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  };

  const updateUserPhone = async (id: string, phone: string) => {
    await supabase.from("profiles").update({ phone }).eq("id", id);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, phone } : u)));
  };

  const resetUserPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) alert("Error: " + error.message);
    else alert(`Password reset link sent to ${email}`);
  };

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
    <div style={{ padding: 20 }}>
      <h2>⚡ Admin Dashboard</h2>

      <section style={{ marginTop: 20 }}>
        <h3>👥 Manage Users</h3>
        <ul>
          {users.map((u) => (
            <li key={u.id} style={{ marginBottom: 8 }}>
              <strong>{u.email}</strong> — {u.phone ?? "No phone"} — <em>{u.role}</em>
              <div style={{ display: "inline-block", marginLeft: 10 }}>
                {u.role === "blocked" ? (
                  <button onClick={() => updateUserRole(u.id, "user")}>Unblock</button>
                ) : (
                  <button onClick={() => updateUserRole(u.id, "blocked")}>Block</button>
                )}
                <input
                  placeholder="update phone"
                  onBlur={(e) => updateUserPhone(u.id, e.target.value)}
                  style={{ marginLeft: 8 }}
                />
                <button onClick={() => resetUserPassword(u.email)} style={{ marginLeft: 6 }}>Reset Password</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>📢 Announcements</h3>
        <textarea
          value={announcementMsg}
          onChange={(e) => setAnnouncementMsg(e.target.value)}
          placeholder="Type announcement..."
          style={{ width: "100%", minHeight: 80 }}
        />
        <div style={{ marginTop: 8 }}>
          <button onClick={sendAnnouncement}>Send Announcement</button>
        </div>
        <ul>
          {announcements.map((a) => (
            <li key={a.id}>
              <strong>{new Date(a.date).toLocaleString()}</strong> — {a.message}
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>✅ Approvals</h3>
        <ul>
          {approvals.map((ap) => (
            <li key={ap.id}>{ap.description ?? "Approval item"}</li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>📂 Files</h3>
        <ul>
          {files.map((f) => (
            <li key={f.id}>{f.filename}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
