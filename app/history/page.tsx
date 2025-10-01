"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Order = {
  id: string;
  bundle_name: string;
  recipient: string;
  price: number;
  status: "Pending" | "Processing" | "Delivered" | "Completed";
  created_at: string;
};

const STATUS_STEPS: Order["status"][] = [
  "Pending",
  "Processing",
  "Delivered",
  "Completed",
];

export default function HistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [role, setRole] = useState<"customer" | "agent" | "admin" | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    setRole((profile?.role as any) ?? "customer");

    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (profile?.role !== "admin") {
      query = query.eq("user_id", user.id);
    }

    const { data, error } = await query;
    if (error) console.error("Error fetching orders:", error);
    else setOrders(data as Order[]);

    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    // realtime
    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          setOrders((prev) => {
            if (payload.eventType === "INSERT") {
              return [payload.new as Order, ...prev];
            }
            if (payload.eventType === "UPDATE") {
              return prev.map((o) =>
                o.id === payload.new.id ? (payload.new as Order) : o
              );
            }
            if (payload.eventType === "DELETE") {
              return prev.filter((o) => o.id !== payload.old.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateOrder = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    if (error) alert("Error updating: " + error.message);
  };

  const bulkUpdate = async (fromStatus: string, toStatus: string) => {
    if (!confirm(`Mark all ${fromStatus} orders as ${toStatus}?`)) return;
    const { error } = await supabase
      .from("orders")
      .update({ status: toStatus })
      .eq("status", fromStatus);

    if (error) alert("Error updating: " + error.message);
  };

  if (loading) return <p className="p-4">Loading orders...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Order History</h2>

      {/* Admin bulk update */}
      {role === "admin" && orders.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-3">
          <button
            className="bg-yellow-500 text-white px-3 py-1 rounded"
            onClick={() => bulkUpdate("Pending", "Processing")}
          >
            Mark all Pending → Processing
          </button>
          <button
            className="bg-green-600 text-white px-3 py-1 rounded"
            onClick={() => bulkUpdate("Processing", "Delivered")}
          >
            Mark all Processing → Delivered
          </button>
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded"
            onClick={() => bulkUpdate("Delivered", "Completed")}
          >
            Mark all Delivered → Completed
          </button>
        </div>
      )}

      {/* Orders */}
      <div className="space-y-6">
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          orders.map((order) => {
            const currentIndex = STATUS_STEPS.indexOf(order.status);

            return (
              <div key={order.id} className="bg-white shadow-md p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{order.bundle_name}</p>
                    <p className="text-sm text-gray-600">
                      Recipient: {order.recipient}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₵{order.price.toFixed(2)}</p>
                  </div>
                </div>

                {/* timeline */}
                <div className="mt-4 flex items-center justify-between">
                  {STATUS_STEPS.map((step, index) => {
                    const isCompleted = index < currentIndex;
                    const isActive = index === currentIndex;

                    return (
                      <div key={step} className="flex-1 flex items-center">
                        <div
                          className={`w-8 h-8 flex items-center justify-center rounded-full text-white text-xs font-bold ${
                            isCompleted || isActive
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        >
                          {isCompleted ? "✅" : index + 1}
                        </div>
                        {index < STATUS_STEPS.length - 1 && (
                          <div
                            className={`flex-1 h-1 ${
                              index < currentIndex
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-600">
                  {STATUS_STEPS.map((s) => (
                    <span key={s} className="w-1/4 text-center">{s}</span>
                  ))}
                </div>

                {/* Admin actions */}
                {role === "admin" && (
                  <div className="mt-3 space-x-2">
                    {order.status === "Pending" && (
                      <button
                        onClick={() => updateOrder(order.id, "Processing")}
                        className="bg-yellow-400 text-white px-2 py-1 rounded text-xs"
                      >
                        ➡ Processing
                      </button>
                    )}
                    {order.status === "Processing" && (
                      <button
                        onClick={() => updateOrder(order.id, "Delivered")}
                        className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                      >
                        ✅ Delivered
                      </button>
                    )}
                    {order.status === "Delivered" && (
                      <button
                        onClick={() => updateOrder(order.id, "Completed")}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                      >
                        🎉 Completed
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
