import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { SupportTickets } from "./SupportTickets";
import { PurchaseAnalytics } from "./PurchaseAnalytics";
import { DarkModeToggle } from "./DarkModeToggle";
import { ExportCSV } from "./ExportCSV";
import { WhatsAppWidget } from "./WhatsAppWidget";

// Dummy toast function
function notify(msg: string, type: "info" | "error" = "info") {
  if (type === "error") alert("Error: " + msg);
  else alert(msg);
}

// --- Types ---
type User = {
  id: string;
  email: string;
  username?: string;
  phone?: string;
  role: string;
  deleted?: boolean;
  [key: string]: any;
};
type Announcement = { id: string; admin_id: string; message: string; date: string };
type ActionLog = { id: string; admin_id: string; action: string; target_id: string; date: string };
type Admin = { id: string; email?: string };

export function AdminDashboard({ admin }: { admin: Admin }) {
  const [users, setUsers] = useState<User[]>([]);
  const [usersQuery, setUsersQuery] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [bulkSelection, setBulkSelection] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<
    "users" | "tickets" | "analytics" | "announcements" | "logs"
  >("users");

  // --- Fetch data ---
  useEffect(() => {
    let usersSub: any, announcementsSub: any, logsSub: any, purchasesSub: any;

    const fetchUsers = async () => {
      setLoadingUsers(true);
      const { data, error } = await supabase.from("users").select("*");
      if (error) setError(error.message);
      setUsers(data || []);
      setLoadingUsers(false);
    };

    const fetchAnnouncements = async () => {
      setLoadingAnnouncements(true);
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("date", { ascending: false });
      if (error) setError(error.message);
      setAnnouncements(data || []);
      setLoadingAnnouncements(false);
    };

    const fetchLogs = async () => {
      setLoadingLogs(true);
      const { data, error } = await supabase
        .from("admin_logs")
        .select("*")
        .order("date", { ascending: false })
        .limit(50);
      if (error) setError(error.message);
      setLogs(data || []);
      setLoadingLogs(false);
    };

    fetchUsers();
    fetchAnnouncements();
    fetchLogs();

    // Subscriptions
    usersSub = supabase
      .channel("users_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, fetchUsers)
      .subscribe();

    announcementsSub = supabase
      .channel("announcements_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, fetchAnnouncements)
      .subscribe();

    logsSub = supabase
      .channel("admin_logs_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_logs" }, fetchLogs)
      .subscribe();

    // Purchases subscription for SMS notification
    purchasesSub = supabase
      .channel("purchases_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "purchases" },
        async (payload) => {
          try {
            await fetch("/api/smsNotify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload.new),
            });
          } catch (err) {
            console.error("Failed to send SMS notification:", err);
          }
        }
      )
      .subscribe();

    return () => {
      usersSub.unsubscribe();
      announcementsSub.unsubscribe();
      logsSub.unsubscribe();
      purchasesSub.unsubscribe();
    };
  }, []);

  // --- Filtered users ---
  const filteredUsers = users.filter(
    (u) =>
      (u.email && u.email.toLowerCase().includes(usersQuery.toLowerCase())) ||
      (u.username && u.username.toLowerCase().includes(usersQuery.toLowerCase())) ||
      (u.role && u.role.toLowerCase().includes(usersQuery.toLowerCase()))
  );

  if (!admin?.id) return <div>Access denied. Admin login required.</div>;

  // --- User Actions ---
  const logAction = async (action: string, target_id: string) => {
    await supabase.from("admin_logs").insert({
      admin_id: admin.id,
      action,
      target_id,
      date: new Date().toISOString(),
    });
  };

  const blockUser = async (id: string) => {
    const { error } = await supabase.from("users").update({ role: "blocked" }).eq("id", id);
    if (error) notify("Failed to block user.", "error");
    else {
      logAction("block_user", id);
      notify("User blocked.");
    }
  };

  const unblockUser = async (id: string) => {
    const { error } = await supabase.from("users").update({ role: "user" }).eq("id", id);
    if (error) notify("Failed to unblock user.", "error");
    else {
      logAction("unblock_user", id);
      notify("User unblocked.");
    }
  };

  const deleteUser = async (id: string) => {
    const { error } = await supabase.from("users").update({ deleted: true }).eq("id", id);
    if (error) notify("Failed to delete user.", "error");
    else {
      logAction("delete_user", id);
      notify("User deleted (soft).");
    }
  };

  const restoreUser = async (id: string) => {
    const { error } = await supabase.from("users").update({ deleted: false }).eq("id", id);
    if (error) notify("Failed to restore user.", "error");
    else {
      logAction("restore_user", id);
      notify("User restored.");
    }
  };

  const bulkBlock = async () => {
    const ids = Object.keys(bulkSelection).filter((id) => bulkSelection[id]);
    if (!ids.length) return;
    const { error } = await supabase.from("users").update({ role: "blocked" }).in("id", ids);
    if (error) notify("Bulk block failed.", "error");
    else {
      ids.forEach((id) => logAction("block_user", id));
      notify(`Blocked ${ids.length} user(s).`);
    }
    setBulkSelection({});
  };

  const bulkUnblock = async () => {
    const ids = Object.keys(bulkSelection).filter((id) => bulkSelection[id]);
    if (!ids.length) return;
    const { error } = await supabase.from("users").update({ role: "user" }).in("id", ids);
    if (error) notify("Bulk unblock failed.", "error");
    else {
      ids.forEach((id) => logAction("unblock_user", id));
      notify(`Unblocked ${ids.length} user(s).`);
    }
    setBulkSelection({});
  };

  // --- Announcements ---
  const sendAnnouncement = async () => {
    if (!announcementMsg.trim()) return;
    const { error } = await supabase.from("announcements").insert({
      admin_id: admin.id,
      message: announcementMsg,
      date: new Date().toISOString(),
    });
    if (error) notify("Failed to send announcement.", "error");
    else {
      logAction("send_announcement", admin.id);
      setAnnouncementMsg("");
      notify("Announcement sent.");
    }
  };

  const deleteAnnouncement = async (id: string) => {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) notify("Failed to delete announcement.", "error");
    else {
      logAction("delete_announcement", id);
      notify("Announcement deleted.");
    }
  };

  // --- Modal for user details ---
  const UserModal = () =>
    selectedUser ? (
      <div
        role="dialog"
        aria-modal="true"
        style={{
          background: "#fff",
          position: "fixed",
          left: 0,
          top: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={() => setSelectedUser(null)}
      >
        <div
          style={{ background: "#222", color: "#fff", padding: 24, minWidth: 350 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h4>User details</h4>
          <pre style={{ whiteSpace: "break-spaces" }}>{JSON.stringify(selectedUser, null, 2)}</pre>
          <button onClick={() => setSelectedUser(null)}>Close</button>
        </div>
      </div>
    ) : null;

  // --- Tab Button Component ---
  const TabButton = ({ tab, label }: { tab: typeof activeTab; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      style={{
        marginRight: 8,
        padding: "6px 12px",
        background: activeTab === tab ? "#2196f3" : "#eee",
        color: activeTab === tab ? "#fff" : "#000",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ padding: 16 }}>
      <h2>Admin Dashboard</h2>
      <DarkModeToggle />
      {error && <div style={{ color: "red" }}>{error}</div>}

      <div style={{ margin: "16px 0" }}>
        <TabButton tab="users" label="Users" />
        <TabButton tab="tickets" label="Support Tickets" />
        <TabButton tab="analytics" label="Purchase Analytics" />
        <TabButton tab="announcements" label="Announcements" />
        <TabButton tab="logs" label="Admin Logs" />
      </div>

      {/* --- Tab Content --- */}
      {activeTab === "users" && (
        <div>
          <input
            type="text"
            value={usersQuery}
            onChange={(e) => setUsersQuery(e.target.value)}
            placeholder="Search by email, username, or role"
            aria-label="Search users"
            style={{ marginBottom: 8 }}
          />
          <div style={{ marginBottom: 8 }}>
            <button onClick={bulkBlock} disabled={Object.keys(bulkSelection).length === 0}>
              Bulk Block
            </button>
            <button onClick={bulkUnblock} disabled={Object.keys(bulkSelection).length === 0}>
              Bulk Unblock
            </button>
            <ExportCSV data={filteredUsers} filename="users_export.csv" />
          </div>
          {loadingUsers ? (
            <div>Loading users...</div>
          ) : (
            <table style={{ width: "100%", marginTop: 8, background: "#fff" }}>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      aria-label="Select all"
                      checked={
                        filteredUsers.length > 0 &&
                        filteredUsers.every((u) => bulkSelection[u.id])
                      }
                      onChange={(e) =>
                        setBulkSelection(
                          filteredUsers.reduce(
                            (a, u) => ({ ...a, [u.id]: e.target.checked }),
                            {}
                          )
                        )
                      }
                    />
                  </th>
                  <th>Email</th>
                  <th>Username</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    style={u.deleted ? { color: "#aaa", textDecoration: "line-through" } : {}}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={!!bulkSelection[u.id]}
                        onChange={(e) =>
                          setBulkSelection({ ...bulkSelection, [u.id]: e.target.checked })
                        }
                      />
                    </td>
                    <td>{u.email}</td>
                    <td>{u.username}</td>
                    <td>{u.phone}</td>
                    <td>{u.role}</td>
                    <td>{u.deleted ? "Deleted" : "Active"}</td>
                    <td>
                      <button onClick={() => setSelectedUser(u)}>View</button>
                      {u.role !== "blocked" ? (
                        <button onClick={() => blockUser(u.id)}>Block</button>
                      ) : (
                        <button onClick={() => unblockUser(u.id)}>Unblock</button>
                      )}
                      {!u.deleted ? (
                        <button onClick={() => deleteUser(u.id)}>Delete</button>
                      ) : (
                        <button onClick={() => restoreUser(u.id)}>Restore</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <UserModal />
        </div>
      )}

      {activeTab === "tickets" && <SupportTickets />}
      {activeTab === "analytics" && <PurchaseAnalytics />}
      {activeTab === "announcements" && (
        <div>
          <h3>Announcements</h3>
          <textarea
            value={announcementMsg}
            onChange={(e) => setAnnouncementMsg(e.target.value)}
            placeholder="Write announcement..."
          />
          <button onClick={sendAnnouncement}>Send</button>
          {loadingAnnouncements ? (
            <div>Loading announcements...</div>
          ) : (
            <ul>
              {announcements.map((a) => (
                <li key={a.id}>
                  {a.message} - {a.date}
                  <button onClick={() => deleteAnnouncement(a.id)}>Delete</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {activeTab === "logs" && (
        <div>
          <h3>Admin Logs</h3>
          {loadingLogs ? (
            <div>Loading logs...</div>
          ) : (
            <ul>
              {logs.map((log) => (
                <li key={log.id}>
                  {log.date}: {log.action} (target: {log.target_id})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <WhatsAppWidget />
    </div>
  );
        }abase } from "../lib/supabaseClient";
import { SupportTickets } from "./SupportTickets";
import { PurchaseAnalytics } from "./PurchaseAnalytics";
import { DarkModeToggle } from "./DarkModeToggle";
import { ExportCSV } from "./ExportCSV";
import { WhatsAppWidget } from "./WhatsAppWidget";

// Dummy toast function
function notify(msg: string, type: "info" | "error" = "info") {
  if (type === "error") alert("Error: " + msg);
  else alert(msg);
}

// --- Types ---
type User = { id: string; email: string; role: string; deleted?: boolean; [key: string]: any };
type Announcement = { id: string; admin_id: string; message: string; date: string };
type ActionLog = { id: string; admin_id: string; action: string; target_id: string; date: string };
type Admin = { id: string; email?: string };

export function AdminDashboard({ admin }: { admin: Admin }) {
  const [users, setUsers] = useState<User[]>([]);
  const [usersQuery, setUsersQuery] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [bulkSelection, setBulkSelection] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"users" | "tickets" | "analytics" | "announcements" | "logs" | "sms">("users");

  // --- SMS state ---
  const [smsNumber, setSmsNumber] = useState("");
  const [smsMessage, setSmsMessage] = useState("");

  // --- Fetch data ---
  useEffect(() => {
    let usersSub: any, announcementsSub: any, logsSub: any;

    const fetchUsers = async () => {
      setLoadingUsers(true);
      const { data, error } = await supabase.from("users").select("*");
      if (error) setError(error.message);
      setUsers(data || []);
      setLoadingUsers(false);
    };

    const fetchAnnouncements = async () => {
      setLoadingAnnouncements(true);
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("date", { ascending: false });
      if (error) setError(error.message);
      setAnnouncements(data || []);
      setLoadingAnnouncements(false);
    };

    const fetchLogs = async () => {
      setLoadingLogs(true);
      const { data, error } = await supabase
        .from("admin_logs")
        .select("*")
        .order("date", { ascending: false })
        .limit(50);
      if (error) setError(error.message);
      setLogs(data || []);
      setLoadingLogs(false);
    };

    fetchUsers();
    fetchAnnouncements();
    fetchLogs();

    usersSub = supabase
      .channel("users_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, fetchUsers)
      .subscribe();

    announcementsSub = supabase
      .channel("announcements_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, fetchAnnouncements)
      .subscribe();

    logsSub = supabase
      .channel("admin_logs_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_logs" }, fetchLogs)
      .subscribe();

    return () => {
      usersSub.unsubscribe();
      announcementsSub.unsubscribe();
      logsSub.unsubscribe();
    };
  }, []);

  // --- Filtered users ---
  const filteredUsers = users.filter(
    (u) =>
      (u.email && u.email.toLowerCase().includes(usersQuery.toLowerCase())) ||
      (u.role && u.role.toLowerCase().includes(usersQuery.toLowerCase()))
  );

  if (!admin?.id) return <div>Access denied. Admin login required.</div>;

  // --- User Actions ---
  const logAction = async (action: string, target_id: string) => {
    await supabase.from("admin_logs").insert({
      admin_id: admin.id,
      action,
      target_id,
      date: new Date().toISOString(),
    });
  };

  const blockUser = async (id: string) => {
    const { error } = await supabase.from("users").update({ role: "blocked" }).eq("id", id);
    if (error) notify("Failed to block user.", "error");
    else {
      logAction("block_user", id);
      notify("User blocked.");
    }
  };

  const unblockUser = async (id: string) => {
    const { error } = await supabase.from("users").update({ role: "user" }).eq("id", id);
    if (error) notify("Failed to unblock user.", "error");
    else {
      logAction("unblock_user", id);
      notify("User unblocked.");
    }
  };

  const deleteUser = async (id: string) => {
    const { error } = await supabase.from("users").update({ deleted: true }).eq("id", id);
    if (error) notify("Failed to delete user.", "error");
    else {
      logAction("delete_user", id);
      notify("User deleted (soft).");
    }
  };

  const restoreUser = async (id: string) => {
    const { error } = await supabase.from("users").update({ deleted: false }).eq("id", id);
    if (error) notify("Failed to restore user.", "error");
    else {
      logAction("restore_user", id);
      notify("User restored.");
    }
  };

  const bulkBlock = async () => {
    const ids = Object.keys(bulkSelection).filter((id) => bulkSelection[id]);
    if (!ids.length) return;
    const { error } = await supabase.from("users").update({ role: "blocked" }).in("id", ids);
    if (error) notify("Bulk block failed.", "error");
    else {
      ids.forEach((id) => logAction("block_user", id));
      notify(`Blocked ${ids.length} user(s).`);
    }
    setBulkSelection({});
  };

  const bulkUnblock = async () => {
    const ids = Object.keys(bulkSelection).filter((id) => bulkSelection[id]);
    if (!ids.length) return;
    const { error } = await supabase.from("users").update({ role: "user" }).in("id", ids);
    if (error) notify("Bulk unblock failed.", "error");
    else {
      ids.forEach((id) => logAction("unblock_user", id));
      notify(`Unblocked ${ids.length} user(s).`);
    }
    setBulkSelection({});
  };

  // --- Announcements ---
  const sendAnnouncement = async () => {
    if (!announcementMsg.trim()) return;
    const { error } = await supabase.from("announcements").insert({
      admin_id: admin.id,
      message: announcementMsg,
      date: new Date().toISOString(),
    });
    if (error) notify("Failed to send announcement.", "error");
    else {
      logAction("send_announcement", admin.id);
      setAnnouncementMsg("");
      notify("Announcement sent.");
    }
  };

  const deleteAnnouncement = async (id: string) => {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) notify("Failed to delete announcement.", "error");
    else {
      logAction("delete_announcement", id);
      notify("Announcement deleted.");
    }
  };

  // --- SMS sending ---
  const sendSMS = async () => {
    if (!smsNumber || !smsMessage) return notify("Provide phone number and message", "error");

    try {
      const res = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: smsNumber, message: smsMessage }),
      });
      const data = await res.json();
      if (data.success) notify("SMS sent successfully!");
      else notify("SMS failed: " + data.message, "error");
    } catch (err) {
      notify("Error sending SMS", "error");
    }
  };

  // --- Modal for user details ---
  const UserModal = () =>
    selectedUser ? (
      <div
        role="dialog"
        aria-modal="true"
        style={{
          background: "#fff",
          position: "fixed",
          left: 0,
          top: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={() => setSelectedUser(null)}
      >
        <div
          style={{ background: "#222", color: "#fff", padding: 24, minWidth: 350 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h4>User details</h4>
          <pre style={{ whiteSpace: "break-spaces" }}>{JSON.stringify(selectedUser, null, 2)}</pre>
          <button onClick={() => setSelectedUser(null)}>Close</button>
        </div>
      </div>
    ) : null;

  // --- Tab Button Component ---
  const TabButton = ({ tab, label }: { tab: typeof activeTab; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      style={{
        marginRight: 8,
        padding: "6px 12px",
        background: activeTab === tab ? "#2196f3" : "#eee",
        color: activeTab === tab ? "#fff" : "#000",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ padding: 16 }}>
      <h2>Admin Dashboard</h2>
      <DarkModeToggle />
      {error && <div style={{ color: "red" }}>{error}</div>}

      <div style={{ margin: "16px 0" }}>
        <TabButton tab="users" label="Users" />
        <TabButton tab="tickets" label="Support Tickets" />
        <TabButton tab="analytics" label="Purchase Analytics" />
        <TabButton tab="announcements" label="Announcements" />
        <TabButton tab="logs" label="Admin Logs" />
        <TabButton tab="sms" label="SMS" />
      </div>

      {/* --- Tab Content --- */}
      <div>
        {activeTab === "users" && (
          <div>
            {/* Users table code here (as in previous AdminDashboard) */}
          </div>
        )}

        {activeTab === "tickets" && <SupportTickets />}
        {activeTab === "analytics" && <PurchaseAnalytics />}
        {activeTab === "announcements" && (
          <div>
            {/* Announcements code here */}
          </div>
        )}
        {activeTab === "logs" && (
          <div>
            {/* Logs code here */}
          </div>
        )}
        {activeTab === "sms" && (
          <div>
            <h3>Send SMS</h3>
            <input
              type="text"
              value={smsNumber}
              onChange={(e) => setSmsNumber(e.target.value)}
              placeholder="Recipient phone number"
              style={{ width: "100%", marginBottom: 8 }}
            />
            <textarea
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
              placeholder="Type your message here"
              style={{ width: "100%", minHeight: 80, marginBottom: 8 }}
            />
            <button onClick={sendSMS}>Send SMS</button>
          </div>
        )}
      </div>

      {UserModal()}
      <WhatsAppWidget />
    </div>
  );
}
