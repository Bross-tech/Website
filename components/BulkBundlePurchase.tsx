import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Agent = {
  id: string;
};

type BulkBundlePurchaseProps = {
  agent: Agent;
  walletBalance: number;
  bundlePrice: number;
  onPurchase?: (totalSpent: number) => void; // ✅ callback to update parent balance
};

export const BulkBundlePurchase: React.FC<BulkBundlePurchaseProps> = ({
  agent,
  walletBalance,
  bundlePrice,
  onPurchase,
}) => {
  const [recipients, setRecipients] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBulkPurchase = async () => {
    setStatus("");
    setLoading(true);

    // Validate input
    const numbers = recipients
      .split(",")
      .map(r => r.trim())
      .filter(Boolean);

    if (numbers.length === 0) {
      setStatus("Please enter at least one recipient number.");
      setLoading(false);
      return;
    }

    const totalCost = numbers.length * bundlePrice;

    if (walletBalance < totalCost) {
      setStatus("Insufficient balance.");
      setLoading(false);
      return;
    }

    // Deduct wallet
    const { error } = await supabase.rpc("decrement_wallet_balance", {
      user_id_input: agent.id,
      amount_input: totalCost,
    });

    if (error) {
      setStatus("❌ Failed to deduct from wallet: " + error.message);
      setLoading(false);
      return;
    }

    // Record purchases
    const { error: insertError } = await supabase.from("purchases").insert(
      numbers.map(num => ({
        network: "Bundle",
        bundle: "Bulk",
        price: bundlePrice,
        date: new Date().toISOString(),
        user_id: agent.id,
        recipient: num,
      }))
    );

    if (insertError) {
      setStatus("❌ Failed to record purchases: " + insertError.message);
      setLoading(false);
      return;
    }

    // ✅ Update parent balance
    if (onPurchase) {
      onPurchase(totalCost);
    }

    setStatus(`✅ Purchased for ${numbers.length} recipient${numbers.length > 1 ? "s" : ""}!`);
    setRecipients("");
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md max-w-md mx-auto">
      <h4 className="text-lg font-semibold mb-3">Bulk Bundle Purchase</h4>

      <textarea
        placeholder="Enter recipient numbers, separated by commas"
        value={recipients}
        onChange={e => setRecipients(e.target.value)}
        rows={3}
        className="w-full border border-gray-300 dark:border-gray-700 p-3 rounded-md mb-4 text-sm resize-y"
        disabled={loading}
      />

      <button
        onClick={handleBulkPurchase}
        disabled={loading}
        className={`w-full py-2 rounded-md font-semibold text-white transition ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading
          ? "Processing..."
          : `Purchase (${bundlePrice} x ${recipients.split(",").filter(Boolean).length})`}
      </button>

      {status && (
        <div
          className={`mt-3 text-sm font-medium ${
            status.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {status}
        </div>
      )}
    </div>
  );
};
