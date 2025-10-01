import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "../../../lib/supabaseClient";
import { notifyUserAndAdmin } from "../../../lib/smsClient";

const ADMIN_PHONE = process.env.ADMIN_PHONE || "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, amount } = req.body;

  if (!userId || typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "Invalid user or amount" });
  }

  try {
    // 1️⃣ Get user wallet
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("id, wallet, email, phone")
      .eq("id", userId)
      .maybeSingle();

    if (profileErr || !profile) {
      return res.status(404).json({ error: "User not found" });
    }

    if ((profile.wallet || 0) < amount) {
      return res.status(400).json({ error: "Insufficient wallet balance" });
    }

    // 2️⃣ Deduct wallet & log transaction atomically
    const { error: txError } = await supabaseAdmin.rpc("deduct_wallet_and_log", {
      user_id: userId,
      deduct_amount: amount,
    });

    if (txError) {
      console.error("Wallet deduction error:", txError);
      return res.status(500).json({ error: "Failed to process wallet payment" });
    }

    const newBalance = (profile.wallet || 0) - amount;

    // 3️⃣ Notify user and admin via SMS
    if (profile.phone) {
      await notifyUserAndAdmin(
        profile.phone,
        `Payment successful ✅ GHS ${amount} deducted from your wallet. New balance: GHS ${newBalance}`
      );
    }
    if (ADMIN_PHONE) {
      await notifyUserAndAdmin(
        ADMIN_PHONE,
        `Wallet payment by ${profile.email}: GHS ${amount}. New balance: GHS ${newBalance}`
      );
    }

    return res.status(200).json({ success: true, newBalance });
  } catch (err) {
    console.error("Wallet payment error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
