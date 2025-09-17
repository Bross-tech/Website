"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function OrderStats({ userId }: { userId: string }) {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    delivered: 0,
  });

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("status");
      if (!data) return;
      setStats({
        total: data.length,
        pending: data.filter((o) => o.status === "Pending").length,
        processing: data.filter((o) => o.status === "Processing").length,
        delivered: data.filter((o) => o.status === "Delivered").length,
      });
    })();
  }, [userId]);

  return (
    <div className="grid grid-cols-2 gap-4">
      {[
        { label: "Total", value: stats.total },
        { label: "Pending", value: stats.pending },
        { label: "Processing", value: stats.processing },
        { label: "Delivered", value: stats.delivered },
      ].map((s) => (
        <div key={s.label} className="bg-white shadow-md p-4 rounded-lg text-center">
          <h3 className="text-lg font-semibold">{s.label}</h3>
          <p className="text-2xl font-bold">{s.value}</p>
        </div>
      ))}
    </div>
  );
}
