"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // ✅ fixed import
import { supabase } from "@/lib/supabaseClient";
import Bundles from "@/components/Bundles";
import CartWidget from "@/components/CartWidget";

export default function Dashboard() {
  const [wallet, setWallet] = useState<number>(0);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    delivered: 0,
  });
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [location, setLocation] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        router.push("/auth");
        return;
      }

      // ✅ fetch wallet (role not needed here anymore)
      const { data: profile } = await supabase
        .from("profiles")
        .select("wallet")
        .eq("id", user.id)
        .single();

      setWallet(profile?.wallet || 0);

      // ✅ fetch order stats
      const { data: orders } = await supabase
        .from("orders")
        .select("status");

      if (orders) {
        setStats({
          total: orders.length,
          pending: orders.filter((o) => o.status === "pending").length,
          processing: orders.filter((o) => o.status === "processing").length,
          delivered: orders.filter((o) => o.status === "delivered").length,
        });
      }

      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  const handleDeposit = async () => {
    const amount = prompt("Enter amount to deposit (GHS)");
    if (!amount) return;
    alert("Redirect to Paystack with amount " + amount);
    // TODO: Implement Paystack deposit flow
  };

  const handleAfaRegister = async () => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) return alert("Please login");

      await supabase.from("approvals").insert([
        {
          user_id: user.id,
          description: `AFA reg for ${fullName} (${mobile})`,
        },
      ]);

      alert("AFA application submitted. Admin will review.");
      setFullName("");
      setMobile("");
      setLocation("");
      setDob("");
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (loading) return <p className="p-4">Loading dashboard...</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Wallet */}
      <div className="bg-white shadow-md p-4 rounded-lg flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Wallet Balance</h2>
          <p className="text-green-600 text-lg">GHS {wallet.toFixed(2)}</p>
        </div>
        <button
          className="bg-green-500 text-white px-3 py-1 rounded-full flex items-center"
          onClick={handleDeposit}
        >
          ➕ Deposit
        </button>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-100 p-4 rounded-lg text-center">
          <p>Total</p>
          <h3 className="text-2xl font-bold">{stats.total}</h3>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg text-center">
          <p>Pending</p>
          <h3 className="text-2xl font-bold">{stats.pending}</h3>
        </div>
        <div className="bg-orange-100 p-4 rounded-lg text-center">
          <p>Processing</p>
          <h3 className="text-2xl font-bold">{stats.processing}</h3>
        </div>
        <div className="bg-green-100 p-4 rounded-lg text-center">
          <p>Delivered</p>
          <h3 className="text-2xl font-bold">{stats.delivered}</h3>
        </div>
      </div>

      {/* Bundles (CartContext handles role) */}
      <Bundles />

      {/* AFA Registration */}
      <div className="bg-white shadow-md p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-3">AFA Registration</h2>
        <input
          className="border p-2 w-full mb-2 rounded"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <input
          className="border p-2 w-full mb-2 rounded"
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />
        <input
          className="border p-2 w-full mb-2 rounded"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          type="date"
          className="border p-2 w-full mb-2 rounded"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
        />
        <div className="text-right">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleAfaRegister}
          >
            Register
          </button>
        </div>
      </div>

      {/* Floating Cart */}
      <CartWidget />
    </div>
  );
}
