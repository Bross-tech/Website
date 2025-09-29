"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<"customer" | "agent" | "admin" | null>(null);
  const [email, setEmail] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        router.push("/auth");
        return;
      }

      setUserId(user.id);
      setEmail(user.email ?? "");

      // fetch role + wallet
      const { data: profile } = await supabase
        .from("profiles")
        .select("wallet, role")
        .eq("id", user.id)
        .single();

      setRole(profile?.role ?? "customer");
      setWallet(profile?.wallet || 0);

      // fetch order stats
      const { data: orders } = await supabase.from("orders").select("status");
      if (orders) {
        setStats({
          total: orders.length,
          pending: orders.filter((o) => o.status === "Pending").length,
          processing: orders.filter((o) => o.status === "Processing").length,
          delivered: orders.filter((o) => o.status === "Delivered").length,
        });
      }

      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  const handleDeposit = async () => {
    if (!userId) return;

    const amountStr = prompt("Enter amount to deposit (GHS)");
    const amount = Number(amountStr);
    if (!amount || amount <= 0) return;

    // @ts-ignore
    const paystack = new window.PaystackPop();
    paystack.newTransaction({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
      amount: amount * 100,
      email: email || "user@example.com",
      callback: async (response: any) => {
        try {
          const res = await fetch("/api/paystack/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference: response.reference, userId, amount }),
          });
          const result = await res.json();
          if (result.success) {
            alert("Deposit successful! Wallet updated.");
            setWallet((prev) => prev + amount);
          } else {
            alert("Deposit failed: " + result.error);
          }
        } catch (err) {
          alert("Verification error");
        }
      },
      onClose: () => alert("Transaction not completed."),
    });
  };

  if (loading) return <p className="p-4">Loading dashboard...</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Wallet + Deposit - only for customers/agents */}
      {role !== "admin" && (
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
      )}

      {/* Order Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div
          onClick={() => router.push("/orders")}
          className="bg-blue-100 p-4 rounded-lg text-center cursor-pointer hover:bg-blue-200"
        >
          <p>Total</p>
          <h3 className="text-2xl font-bold">{stats.total}</h3>
        </div>
        <div
          onClick={() => router.push("/orders?status=Pending")}
          className="bg-yellow-100 p-4 rounded-lg text-center cursor-pointer hover:bg-yellow-200"
        >
          <p>Pending</p>
          <h3 className="text-2xl font-bold">{stats.pending}</h3>
        </div>
        <div
          onClick={() => router.push("/orders?status=Processing")}
          className="bg-orange-100 p-4 rounded-lg text-center cursor-pointer hover:bg-orange-200"
        >
          <p>Processing</p>
          <h3 className="text-2xl font-bold">{stats.processing}</h3>
        </div>
        <div
          onClick={() => router.push("/orders?status=Delivered")}
          className="bg-green-100 p-4 rounded-lg text-center cursor-pointer hover:bg-green-200"
        >
          <p>Delivered</p>
          <h3 className="text-2xl font-bold">{stats.delivered}</h3>
        </div>
      </div>

      {/* Bundles - only for customers/agents */}
      {role !== "admin" && <Bundles role={role} />}

      {/* Floating Cart - only for customers/agents */}
      {role !== "admin" && <CartWidget />}
    </div>
  );
}
