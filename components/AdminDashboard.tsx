import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function AdminDashboard({ user }) {
  const [users, setUsers] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [approvals, setApprovals] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Users
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("id, email, role");
      if (usersError) console.error(usersError);
      else setUsers(usersData || []);

      // Announcements
      const { data: annData, error: annError } = await supabase
        .from("announcements")
        .select("*")
        .order("date", { ascending: false });
      if (annError) console.error(annError);
      else setAnnouncements(annData || []);

      // Pending approvals
      const { data: appData, error: appError } = await supabase
        .from("approvals")
        .select("*")
        .eq("status", "pending");
      if (appError) console.error(appError);
      else setApprovals(appData || []);

      // Files
      const { data: filesData, error: filesError } = await supabase.storage
        .from("files")
        .list();
      if (filesError) console.error(filesError);
      else setFiles(filesData || []);

      setLoading(false);
    };

    fetchData();
  }, []);

  // Block / Unblock user
  const updateUserRole = async (id: string, role: string) => {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (error) {
      console.error(error);
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
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
    setAnnouncements((prev) => [data, ...prev]);
    setAnnouncementMsg("");
  };

  // Approve or reject requests
  const handleApproval = async (id: string, status: string) => {
    const { error } = await supabase
      .from("approvals")
      .update({ status })
      .eq("id", id);
    if (error) {
      console.error(error);
      return;
    }
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  };

  // Delete file
  const deleteFile = async (fileName: string) => {
    const { error } = await supabase.storage.from("files").remove([fileName]);
    if (error) {
      console.error(error);
      return;
    }
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  if (loading) return <p>Loading admin dashboard...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>⚡ Admin Dashboard</h2>

      {/* User Management */}
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
        <h3>✅ Pending Approvals</h3>
        {approvals.length === 0 ? (
          <p>No pending approvals</p>
        ) : (
          <ul>
            {approvals.map((a) => (
              <li key={a.id}>
                {a.description} - {a.status}
                <button onClick={() => handleApproval(a.id, "approved")}>Approve</button>
                <button onClick={() => handleApproval(a.id, "rejected")}>Reject</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* File Manager */}
      <div style={{ marginTop: "20px" }}>
        <h3>📂 File Manager</h3>
        {files.length === 0 ? (
          <p>No files uploaded</p>
        ) : (
          <ul>
            {files.map((f) => (
              <li key={f.name}>
                {f.name} ({f.metadata?.size || 0} bytes)
                <button onClick={() => deleteFile(f.name)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
