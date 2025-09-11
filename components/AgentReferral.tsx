import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { generateReferralLink } from "../lib/referral";

interface Agent {
  id: string;
  email?: string;
}

interface User {
  email: string;
}

export function AgentReferral({ agent }: { agent: Agent }) {
  const [referrals, setReferrals] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!agent?.id) return;

    const fetchReferrals = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("email")
        .eq("referrer_id", agent.id);

      if (error) {
        console.error("Error fetching referrals:", error.message);
      } else {
        setReferrals(data || []);
      }
      setLoading(false);
    };

    fetchReferrals();
  }, [agent?.id]);

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow">
      <h3 className="text-lg font-semibold mb-2">Your Referral Link</h3>
      
      <input
        type="text"
        value={generateReferralLink(agent.id)}
        readOnly
        className="w-full px-3 py-2 border rounded mb-3 dark:bg-gray-700 dark:text-white"
        onClick={(e) => (e.target as HTMLInputElement).select()}
      />

      <div className="mb-2">
        <strong>Referred Users:</strong>{" "}
        {loading ? "Loading..." : referrals.length}
      </div>

      <ul className="list-disc ml-6">
        {referrals.map((u) => (
          <li key={u.email}>{u.email}</li>
        ))}
      </ul>
    </div>
  );
}
