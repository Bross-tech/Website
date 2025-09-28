"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Order = {
  id: string;
  status: string;
  created_at: string;
  amount: number;
};

export default function Orders() {
  const searchParams = useSearchParams();
  const filterStatus = searchParams.get("status"); // ✅ read from query param
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
        return;
      }

      let filtered = data || [];
      if (filterStatus) {
        filtered = filtered.filter((o) => o.status === filterStatus);
      }

      setOrders(filtered as Order[]);
      setLoading(false);
    };

    fetchOrders();
  }, [filterStatus]);

  if (loading) {
    return <p className="text-center mt-20 text-lg">Loading orders...</p>;
  }

  if (orders.length === 0) {
    return (
      <p className="text-center mt-20 text-lg">
        No {filterStatus ? filterStatus : ""} orders found.
      </p>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">
        {filterStatus ? `${filterStatus} Orders` : "All Orders"}
      </h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white shadow-md p-4 rounded-lg flex justify-between items-center"
          >
            <div>
              <p className="text-sm text-gray-500">
                {new Date(order.created_at).toLocaleString()}
              </p>
              <p className="font-semibold">Status: {order.status}</p>
            </div>
            <div className="text-lg font-bold text-green-600">
              GHS {order.amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
