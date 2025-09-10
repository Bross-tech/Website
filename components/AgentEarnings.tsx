import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Agent = {
  id: string;
};

type Commission = {
  amount: number;
};

type AgentEarningsProps = {
  agent: Agent;
};

export const AgentEarnings: React.FC<AgentEarningsProps> = ({ agent }) => {
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    supabase
      .from("commissions")
      .select("amount")
      .eq("agent_id", agent.id)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setError("Failed to fetch earnings.");
          setEarnings(0);
        } else {
          setEarnings(
            data?.reduce((sum: number, c: Commission) => sum + (c.amount || 0), 0) ?? 0
          );
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [agent.id]);

  return (
    <div
      style={{
        background: "#fff",
        padding: 24,
        borderRadius: 8,
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        maxWidth: 340,
        margin: "24px auto",
        fontSize: "1.18rem",
        color: "#183153",
        textAlign: "center"
      }}
    >
      {loading ? (
        <span>Loading earnings...</span>
      ) : error ? (
        <span style={{ color: "red" }}>{error}</span>
      ) : (
        <span>
          Your Earnings:{" "}
          <span style={{ fontWeight: 700, color: "#217346" }}>
            GHS {earnings.toFixed(2)}
          </span>
        </span>
      )}
    </div>
  );
};
