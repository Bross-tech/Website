import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabaseClient";

type VerifyRequestBody = {
  reference: string;
  userId: string;
  amount: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  if (!process.env.PAYSTACK_SECRET_KEY) {
    return res.status(500).json({ success: false, message: "Server misconfigured: missing PAYSTACK_SECRET_KEY" });
  }

  const { reference, userId, amount } = req.body as VerifyRequestBody;

  if (!reference || !userId || !amount) {
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

    if (!verifyData.status) {
      return res.status(400).json({ success: false, message: verifyData.message || "Paystack verification failed" });
    }

    if (verifyData.data.status !== "success") {
      return res.status(400).json({ success: false, message: "Payment not successful" });
    }

    // ✅ Payment verified, now update wallet
    const { error: rpcError } = await supabase.rpc("increment_wallet_balance", {
      user_id_input: userId,
      amount_input: amount,
    });

    if (rpcError) {
      console.error("Wallet update error:", rpcError.message);
      return res.status(500).json({ success: false, message: "Failed to update wallet" });
    }

    // ✅ Fetch updated balance
    const { data: walletData, error: walletError } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (walletError) {
      console.error("Wallet fetch error:", walletError.message);
      return res.status(500).json({ success: false, message: "Wallet updated but failed to fetch balance" });
    }

    return res.status(200).json({
      success: true,
      message: "Wallet updated",
      balance: walletData.balance,
    });
  } catch (err: any) {
    console.error("Verify payment error:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
