import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { generateReferralLink } from "../lib/referral";

interface AgentReferralProps {
  agent: any; // expects supabase user object
}

export function AgentReferral({ agent }: AgentReferralProps) {
  const [referrals, setReferrals] = useState<any[]>([]);

  useEffect(() => {
    if (!agent?.id) return;

    // ✅ Fetch from referrals table (joins with users for email)
    const fetchReferrals = async () => {
      const { data, error } = await supabase
        .from("referrals")
        .select("id, created_at, users!referrals_referred_id_fkey(email)")
        .eq("referrer_id", agent.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching referrals:", error.message);
      } else {
        setReferrals(data || []);
      }
    };

    fetchReferrals();
  }, [agent]);

  return (
    <div className="p-4 bg-gray-100 rounded shadow space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          Your Referral Link
          {/* ✅ Badge */}
          <span className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
            {referrals.length}
          </span>
        </h3>
      </div>

      <input
        type="text"
        value={generateReferralLink(agent.id)}
        readOnly
        className="w-full border p-2 rounded bg-gray-50"
      />

      <ul className="list-disc list-inside text-sm text-gray-700">
        {referrals.map((ref) => (
          <li key={ref.id}>
            {ref.users?.email || "Unknown user"} (
            {new Date(ref.created_at).toLocaleDateString()})
          </li>
        ))}
      </ul>
    </div>
  );
}
