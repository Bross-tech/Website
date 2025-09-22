import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useOrderStats(userId: string | null) {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    delivered: 0,
  });

  useEffect(() => {
    if (!userId) return;

    async function fetchStats() {
      const { data, error } = await supabase
        .from("orders")
        .select("status", { count: "exact" })
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching orders:", error);
        return;
      }

      if (data) {
        const total = data.length;
        const pending = data.filter((o) => o.status === "pending").length;
        const processing = data.filter((o) => o.status === "processing").length;
        const delivered = data.filter((o) => o.status === "delivered").length;

        setStats({ total, pending, processing, delivered });
      }
    }

    fetchStats();

    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        fetchStats
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return stats;
}
