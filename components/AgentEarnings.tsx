import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function AgentEarnings({ agent }) {
  const [earnings, setEarnings] = useState(0);

  useEffect(() => {
    supabase
      .from("commissions")
      .select("amount")
      .eq("agent_id", agent.id)
      .then(({ data }) =>
        setEarnings(data?.reduce((sum, c) => sum + c.amount, 0) ?? 0)
      );
  }, [agent.id]);

  return <div>Your Earnings: GHS {earnings.toFixed(2)}</div>;
}
