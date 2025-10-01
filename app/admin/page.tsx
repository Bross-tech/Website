"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Order = {
  id: string;
  user_id: string;
  bundle: string;
  status: string;
  created_at: string;
};

type Afa = {
  id: string;
  user_id: string;
  full_name: string;
  mobile: string;
  status: string;
  created_at: string;
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [afas, setAfas] = useState<Afa[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAdminData = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        router.push("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      await fetchOrders();
      await fetchAfas();

      setLoading(false);
    };

    fetchAdminData();
  }, [router]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setOrders(data as Order[]);
  };

  const fetchAfas = async () => {
    const { data } = await supabase
      .from("approvals")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setAfas(data as Afa[]);
  };

  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    fetchOrders();
  };

  const updateAfaStatus = async (id: string, status: string) => {
    await supabase.from("approvals").update({ status }).eq("id", id);
    fetchAfas();
  };

  const statusOptions = (type: "order" | "afa") =>
    type === "order"
      ? ["Pending", "Processing", "Delivered"]
      : ["Pending", "Processing", "Completed"];

  if (loading) return <p className="p-4">Loading admin dashboard...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* Orders Management */}
      <div className="bg-white shadow-md p-4 rounded-lg">
        <h2 className="font-bold text-lg mb-3">Manage Orders</h2>
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="flex justify-between items-center border p-3 rounded shadow-sm">
              <div>
                <p className="font-medium">{o.bundle}</p>
                <p className="text-xs text-gray-500">
                  User: {o.user_id} • {new Date(o.created_at).toLocaleString()}
                </p>
              </div>
              <select
                value={o.status}
                onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                className="border rounded p-1"
              >
                {statusOptions("order").map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      </div>

      {/* AFA Registrations Management */}
      <div className="bg-white shadow-md p-4 rounded-lg">
        <h2 className="font-bold text-lg mb-3">Manage AFA Registrations</h2>
        <ul className="space-y-3">
          {afas.map((a) => (
            <li key={a.id} className="flex justify-between items-center border p-3 rounded shadow-sm">
              <div>
                <p className="font-medium">{a.full_name} ({a.mobile})</p>
                <p className="text-xs text-gray-500">
                  User: {a.user_id} • {new Date(a.created_at).toLocaleString()}
                </p>
              </div>
              <select
                value={a.status}
                onChange={(e) => updateAfaStatus(a.id, e.target.value)}
                className="border rounded p-1"
              >
                {statusOptions("afa").map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
