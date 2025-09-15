// pages/api/verifyPayment.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabaseClient";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { reference, userId, amount, phone } = req.body;

  if (!reference || !userId || !amount || !phone) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    // ✅ Verify with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const verifyData = await verifyRes.json();

    if (verifyData.status && verifyData.data.status === "success") {
      // ✅ Update wallet balance
      const { error: walletError } = await supabase.rpc("increment_wallet_balance", {
        user_id_input: userId,
        amount_input: amount,
      });

      if (walletError) {
        console.error("Wallet update error:", walletError.message);
        return res.status(500).json({ success: false, message: "Failed to update wallet" });
      }

      // ✅ Save purchase record in Supabase
      const { error: purchaseError } = await supabase.from("purchases").insert([
        {
          user_id: userId,
          reference,
          amount,
          status: "success",
          payment_provider: "paystack",
          created_at: new Date(),
        },
      ]);

      if (purchaseError) {
        console.error("Purchase insert error:", purchaseError.message);
        return res.status(500).json({ success: false, message: "Failed to save purchase record" });
      }

      // ✅ Send SMS confirmation via Africa’s Talking
      await axios.post(
        "https://api.africastalking.com/version1/messaging",
        new URLSearchParams({
          username: process.env.AT_USERNAME!,
          to: phone,
          message: `✅ Payment of GHS ${amount} received. Ref: ${reference}. Wallet credited.`,
          from: process.env.AT_SENDER || "DataStore4gh",
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            apiKey: process.env.AT_API_KEY!,
          },
        }
      );

      return res.status(200).json({ success: true, message: "Wallet updated, purchase saved & SMS sent" });
    } else {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  } catch (err: any) {
    console.error("Verify payment error:", err?.message ?? err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
