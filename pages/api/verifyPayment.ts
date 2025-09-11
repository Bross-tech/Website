import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { reference, userId, amount } = req.body;

  if (!reference || !userId || !amount) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    // ✅ Verify with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // secret key
      },
    });

    const verifyData = await verifyRes.json();

    if (verifyData.status && verifyData.data.status === "success") {
      // ✅ Payment verified, now update wallet
      const { error } = await supabase.rpc("increment_wallet_balance", {
        user_id_input: userId,
        amount_input: amount,
      });

      if (error) {
        console.error("Wallet update error:", error.message);
        return res.status(500).json({ success: false, message: "Failed to update wallet" });
      }

      return res.status(200).json({ success: true, message: "Wallet updated" });
    } else {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  } catch (err: any) {
    console.error("Verify payment error:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
