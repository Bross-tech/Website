import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Agent = {
  id: string;
};

type BulkBundlePurchaseProps = {
  agent: Agent;
  walletBalance: number;
  bundlePrice: number;
};

export const BulkBundlePurchase: React.FC<BulkBundlePurchaseProps> = ({
  agent,
  walletBalance,
  bundlePrice,
}) => {
  const [recipients, setRecipients] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBulkPurchase = async () => {
    setStatus("");
    setLoading(true);

    // Validate and sanitize input
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

    const { error } = await supabase.rpc("decrement_wallet_balance", {
      user_id_input: agent.id,
      amount_input: totalCost,
    });

    if (error) {
      setStatus("Failed to deduct from wallet: " + error.message);
      setLoading(false);
      return;
    }

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
      setStatus("Failed to record purchases: " + insertError.message);
      setLoading(false);
      return;
    }

    setStatus(`Purchased for ${numbers.length} recipient${numbers.length > 1 ? "s" : ""}!`);
    setRecipients("");
    setLoading(false);
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: 24,
        borderRadius: 8,
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        maxWidth: 400,
        margin: "24px auto",
      }}
    >
      <h4 style={{ marginBottom: 8 }}>Bulk Bundle Purchase</h4>
      <textarea
        placeholder="Enter recipient numbers, separated by commas"
        value={recipients}
        onChange={e => setRecipients(e.target.value)}
        rows={3}
        style={{
          width: "100%",
          padding: 9,
          border: "1px solid #d4d4d4",
          borderRadius: 4,
          marginBottom: 12,
          fontSize: "1rem",
          resize: "vertical",
        }}
        disabled={loading}
      />
      <button
        onClick={handleBulkPurchase}
        disabled={loading}
        style={{
          width: "100%",
          padding: "11px 0",
          background: loading ? "#b5b5b5" : "#183153",
          color: "#fff",
          border: "none",
          borderRadius: 5,
          fontSize: "1rem",
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background 0.2s",
        }}
      >
        {loading
          ? "Processing..."
          : `Purchase (${bundlePrice} x ${recipients.split(",").filter(Boolean).length})`}
      </button>
      {status && (
        <div style={{ marginTop: 14, color: status.includes("fail") || status.includes("Insufficient") ? "red" : "green" }}>
          {status}
        </div>
      )}
    </div>
  );
};
