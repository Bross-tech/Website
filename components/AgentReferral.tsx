import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { generateReferralLink } from "../lib/referral";

export function AgentReferral({ agent }: { agent: any }) {
  const [referrals, setReferrals] = useState<{ email: string }[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!agent?.id) return;
    supabase
      .from("users")
      .select("email")
      .eq("referrer_id", agent.id)
      .then(({ data }) => setReferrals(data || []));
  }, [agent]);

  const referralLink = generateReferralLink(agent.id);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 bg-gray-900 text-white rounded-2xl shadow space-y-4">
      <h3 className="text-lg font-bold">Your Referral Link</h3>

      {/* Referral Link Box */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={referralLink}
          readOnly
          className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-sm"
        />
        <button
          onClick={handleCopy}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white transition"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Referral Count */}
      <div className="font-semibold">
        Referred Users: {referrals.length}
      </div>

      {/* Referral List */}
      <ul className="space-y-1 text-sm">
        {referrals.length > 0 ? (
          referrals.map((u) => (
            <li
              key={u.email}
              className="p-2 bg-gray-800 rounded border border-gray-700"
            >
              {u.email}
            </li>
          ))
        ) : (
          <li className="text-gray-400">No referrals yet.</li>
        )}
      </ul>
    </div>
  );
}
