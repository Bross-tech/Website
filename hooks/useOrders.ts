import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useOrders(userId: string | null) {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;

    // Fetch initial orders
    supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setOrders(data);
      });

    // Subscribe to real-time changes
    const channel = supabase
      .channel("orders-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${userId}` },
        (payload) => {
          console.log("Realtime order update:", payload);
          if (payload.eventType === "INSERT") {
            setOrders((prev) => [payload.new, ...prev]);
          }
          if (payload.eventType === "UPDATE") {
            setOrders((prev) =>
              prev.map((o) => (o.id === payload.new.id ? payload.new : o))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return orders;
}
