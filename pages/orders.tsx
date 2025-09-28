"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface Order {
  id: string;
  status: string;
  amount: number;
  created_at: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status"); // e.g. "Pending"

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);

      let query = supabase.from("orders").select("*").order("created_at", { ascending: false });

      if (statusFilter && statusFilter !== "All") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) {
        console.error(error);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [statusFilter]);

  if (loading) {
    return <p className="text-center mt-20">Loading orders...</p>;
  }

  if (orders.length === 0) {
    return (
      <p className="text-center mt-20 text-lg text-gray-500">
        No {statusFilter && statusFilter !== "All" ? statusFilter.toLowerCase() : ""} orders found.
      </p>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {statusFilter && statusFilter !== "All" ? statusFilter : "All"} Orders
      </h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Amount (GHS)</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{order.id}</td>
                <td className="p-3">{order.status}</td>
                <td className="p-3">{order.amount}</td>
                <td className="p-3">{new Date(order.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
