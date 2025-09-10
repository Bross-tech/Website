import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

type User = {
  id: string;
  balance?: number;
};

export function PromoCodeRedeem({ user }: { user: User }) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRedeem = async () => {
    setLoading(true);
    setStatus("");
    const inputCode = code.trim();
    if (!inputCode) {
      setStatus("Please enter a promo code.");
      setLoading(false);
      return;
    }
    // Fetch the promo code
    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", inputCode)
      .single();

    if (error) {
      setStatus("Invalid or used code.");
      setLoading(false);
      return;
    }
    if (data && !data.used) {
      // Optional: You may want to credit a specific reward amount to the user's wallet here.
      // For example, if the promo code has a reward_amount column:
      let reward = 0;
      if (typeof data.reward_amount === "number") {
        reward = data.reward_amount;
      }

      // Update promo code as used
      const { error: updateError } = await supabase
        .from("promo_codes")
        .update({ used: true, user_id: user.id, used_at: new Date().toISOString() })
        .eq("id", data.id);

      if (updateError) {
        setStatus("Error redeeming code. Please try again.");
        setLoading(false);
        return;
      }

      // Credit the user's wallet if reward exists
      if (reward > 0) {
        await supabase
          .from("users")
          .update({ balance: (user.balance ?? 0) + reward })
          .eq("id", user.id);
      }

      setStatus("Promo code redeemed!" + (reward > 0 ? ` You got GHS ${reward.toFixed(2)}!` : ""));
      setCode("");
    } else {
      setStatus("Invalid or used code.");
    }
    setLoading(false);
  };

  return (
    <div>
      <input
        value={code}
        onChange={e => setCode(e.target.value)}
        placeholder="Enter promo code"
        aria-label="Enter promo code"
        disabled={loading}
      />
      <button onClick={handleRedeem} disabled={loading || !code.trim()}>
        {loading ? "Redeeming..." : "Redeem"}
      </button>
      <div>{status}</div>
    </div>
  );
}
