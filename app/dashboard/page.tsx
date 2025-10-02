"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import CartWidget from "@/components/CartWidget";
import Image from "next/image";

type Bundle = {
  id: string;
  name: string;
  network: "MTN" | "TELECEL" | "AIRTELTIGO";
  price: number;
  type: "data" | "airtime";
  size: string;
  logo?: string;
};

const networkColors: Record<string, string> = {
  MTN: "bg-yellow-400 text-black",
  TELECEL: "bg-red-600 text-white",
  AIRTELTIGO: "bg-blue-600 text-white",
};

const networkLogos: Record<string, string> = {
  MTN: "/logos/mtn.png",
  TELECEL: "/logos/telecel.png",
  AIRTELTIGO: "/logos/airteltigo.png",
};

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
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchProfileAndBundles = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        router.push("/auth");
        return;
      }

      setUserId(user.id);
      setEmail(user.email ?? "");

      // Fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("wallet, role")
        .eq("id", user.id)
        .single();

      const userRole =
        (profile?.role as "customer" | "agent" | "admin") ?? "customer";
      setRole(userRole);
      setWallet(profile?.wallet || 0);

      // Fetch order stats
      const { data: orders } = await supabase.from("orders").select("status");
      if (orders) {
        setStats({
          total: orders.length,
          pending: orders.filter((o) => o.status === "Pending").length,
          processing: orders.filter((o) => o.status === "Processing").length,
          delivered: orders.filter((o) => o.status === "Delivered").length,
        });
      }

      // Only fetch bundles if not admin
      if (userRole !== "admin") {
        const { data: bundlesData, error } = await supabase
          .from("bundles")
          .select("*")
          .eq("type", "data");

        if (error) console.error("Error fetching bundles:", error);
        else setBundles(bundlesData || []);
      }

      setLoading(false);
    };

    fetchProfileAndBundles();
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
            body: JSON.stringify({
              reference: response.reference,
              userId,
              amount,
            }),
          });
          const result = await res.json();
          if (result.success) setWallet((prev) => prev + amount);
          else alert("Deposit failed: " + result.error);
        } catch {
          alert("Verification error");
        }
      },
      onClose: () => alert("Transaction not completed."),
    });
  };

  const handleUpgrade = async () => {
    if (!userId) return;
    if (!confirm("Upgrade to Agent for 25 GHS?")) return;

    // @ts-ignore
    const paystack = new window.PaystackPop();
    paystack.newTransaction({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
      amount: 25 * 100,
      email: email || "user@example.com",
      callback: async (response: any) => {
        try {
          const res = await fetch("/api/paystack/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reference: response.reference,
              userId,
              amount: 25,
            }),
          });
          const result = await res.json();
          if (result.success) {
            await supabase
              .from("profiles")
              .update({ role: "agent" })
              .eq("id", userId);
            setRole("agent");
            alert("You are now an Agent! Enjoy discounted bundles.");
          } else alert("Upgrade failed: " + result.error);
        } catch {
          alert("Upgrade verification error");
        }
      },
      onClose: () => alert("Transaction not completed."),
    });
  };

  if (loading) return <p className="p-4">Loading dashboard...</p>;

  return (
    <div className="p-6 space-y-6">
      {role === "admin" ? (
        <div className="bg-white shadow-md p-6 rounded-lg text-center">
          <h2 className="text-xl font-bold mb-2">Admin Access</h2>
          <p className="mb-4 text-gray-600">
            Manage orders and AFA registrations.
          </p>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold"
            onClick={() => router.push("/admin")}
          >
            Go to Admin Dashboard
          </button>
        </div>
      ) : (
        <>
          {/* Wallet */}
          <div className="bg-white shadow-md p-4 rounded-lg flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Wallet Balance</h2>
              <p className="text-green-600 text-lg">GHS {wallet.toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              <button
                className="bg-green-500 text-white px-3 py-1 rounded-full"
                onClick={handleDeposit}
              >
                ➕ Deposit
              </button>
              {role === "customer" && (
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded-full"
                  onClick={handleUpgrade}
                >
                  ⬆️ Upgrade to Agent
                </button>
              )}
            </div>
          </div>

          {/* Order Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className="bg-blue-100 p-4 rounded-lg text-center cursor-pointer"
              onClick={() => router.push("/orders")}
            >
              <p>Total</p>
              <h3 className="text-2xl font-bold">{stats.total}</h3>
            </div>
            <div
              className="bg-yellow-100 p-4 rounded-lg text-center cursor-pointer"
              onClick={() => router.push("/orders?status=Pending")}
            >
              <p>Pending</p>
              <h3 className="text-2xl font-bold">{stats.pending}</h3>
            </div>
            <div
              className="bg-orange-100 p-4 rounded-lg text-center cursor-pointer"
              onClick={() => router.push("/orders?status=Processing")}
            >
              <p>Processing</p>
              <h3 className="text-2xl font-bold">{stats.processing}</h3>
            </div>
            <div
              className="bg-green-100 p-4 rounded-lg text-center cursor-pointer"
              onClick={() => router.push("/orders?status=Delivered")}
            >
              <p>Delivered</p>
              <h3 className="text-2xl font-bold">{stats.delivered}</h3>
            </div>
          </div>

          {/* Bundles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {bundles.map((bundle) => (
              <div
                key={bundle.id}
                className={`relative p-4 rounded-lg shadow-md ${networkColors[bundle.network]}`}
              >
                <div className="absolute top-2 right-2 bg-white text-black text-xs px-2 py-1 rounded-full font-bold">
                  Non-expiring
                </div>
                <div className="flex justify-center mb-2">
                  <Image
                    src={bundle.logo || networkLogos[bundle.network]}
                    alt={bundle.network}
                    width={50}
                    height={50}
                  />
                </div>
                <h3 className="text-white font-bold text-center text-lg">
                  {bundle.name}
                </h3>
                <p className="text-white text-center">{bundle.size}</p>
                <p className="text-white text-center font-semibold">
                  GHS {bundle.price.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <CartWidget />
        </>
      )}
    </div>
  );
}
