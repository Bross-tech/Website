"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface AdminDashboardProps {
  user: { id: string; email?: string; role?: string };
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [approvals, setApprovals] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [wallet, setWallet] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [amount, setAmount] = useState("");

  // Fetch all data on load
  useEffect(() => {
    const fetchData = async () => {
      // Users
      const { data: usersData } = await supabase.from("profiles").select("id, email, phone, role");
      setUsers(usersData || []);

      // Announcements
      const { data: annData } = await supabase
        .from("announcements")
        .select("*")
        .order("date", { ascending: false });
      setAnnouncements(annData || []);

      // Approvals
      const { data: approvalsData } = await supabase.from("approvals").select("*");
      setApprovals(approvalsData || []);

      // Files
      const { data: filesData } = await supabase.from("files").select("*");
      setFiles(filesData || []);

      // Admin wallet
      const { data: profile } = await supabase
        .from("profiles")
        .select("wallet")
        .eq("id", user.id)
        .single();
      setWallet(profile?.wallet || 0);

      // Admin purchases/orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(ordersData || []);
    };
    fetchData();
  }, [user.id]);

  // Update user role
  const updateUserRole = async (id: string, role: string) => {
    await supabase.from("profiles").update({ role }).eq("id", id);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  };

  // Update user phone
  const updateUserPhone = async (id: string, phone: string) => {
    await supabase.from("profiles").update({ phone }).eq("id", id);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, phone } : u)));
  };

  // Reset user password
  const resetUserPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) alert("Error: " + error.message);
    else alert(`Password reset link sent to ${email}`);
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

  // Add wallet balance
  const handleAddBalance = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return alert("Enter a valid amount");

    try {
      await supabase.rpc("increment_wallet", {
        user_id_input: user.id,
        amount_input: amt,
      });
      setWallet((prev) => prev + amt);
      setAmount("");
      alert(`Added GHS ${amt} to your wallet`);
    } catch (err) {
      console.error(err);
      alert("Failed to add balance");
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* Admin Wallet */}
      <section className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-3 text-gray-800">💰 Admin Wallet</h2>
        <div className="flex items-center gap-4 mb-4">
          <p className="text-lg font-bold text-green-600">Balance: GHS {wallet.toFixed(2)}</p>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border px-2 py-1 rounded"
          />
          <button
            onClick={handleAddBalance}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Add Balance
          </button>
        </div>

        <h3 className="text-lg font-semibold mb-2 text-gray-800">Your Purchases</h3>
        {orders.length === 0 ? (
          <p>No purchases yet.</p>
        ) : (
          <ul className="space-y-1">
            {orders.map((o) => (
              <li key={o.id} className="p-2 border rounded hover:bg-gray-50 transition">
                {o.description} — <span className="text-green-600">GHS {o.amount}</span> — {new Date(o.created_at).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Manage Users */}
      <section className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-3 text-gray-800">👥 Manage Users</h2>
        <ul>
          {users.map((u) => (
            <li key={u.id} className="mb-3">
              <strong>{u.email}</strong> — {u.phone ?? "No phone"} — <em>{u.role}</em>
              <div className="inline-block ml-2 space-x-2">
                {u.role === "blocked" ? (
                  <button onClick={() => updateUserRole(u.id, "user")} className="btn">Unblock</button>
                ) : (
                  <>
                    <button onClick={() => updateUserRole(u.id, "blocked")} className="btn">Block</button>
                    <button onClick={() => updateUserRole(u.id, "agent")} className="btn">Upgrade to Agent</button>
                    <button onClick={() => updateUserRole(u.id, "admin")} className="btn">Upgrade to Admin</button>
                  </>
                )}
                <input
                  placeholder="update phone"
                  onBlur={(e) => updateUserPhone(u.id, e.target.value)}
                  className="border px-2 py-1 rounded"
                />
                <button onClick={() => resetUserPassword(u.email)} className="btn">Reset Password</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Announcements */}
      <section className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-3 text-gray-800">📢 Announcements</h2>
        <textarea
          value={announcementMsg}
          onChange={(e) => setAnnouncementMsg(e.target.value)}
          placeholder="Type announcement..."
          className="w-full border p-2 rounded mb-2"
        />
        <button onClick={sendAnnouncement} className="btn mb-2">Send Announcement</button>
        <ul>
          {announcements.map((a) => (
            <li key={a.id}>
              <strong>{new Date(a.date).toLocaleString()}</strong> — {a.message}
            </li>
          ))}
        </ul>
      </section>

      {/* Approvals */}
      <section className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-3 text-gray-800">✅ Approvals</h2>
        <ul>
          {approvals.map((ap) => (
            <li key={ap.id}>{ap.description ?? "Approval item"}</li>
          ))}
        </ul>
      </section>

      {/* Files */}
      <section className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-3 text-gray-800">📂 Files</h2>
        <ul>
          {files.map((f) => (
            <li key={f.id}>{f.filename}</li>
          ))}
        </ul>
      </section>
    </div>
  );
                                                       }
