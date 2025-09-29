// pages/api/paystack/verify.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "../../../lib/supabaseClient";
import { notifyUserAndAdmin } from "../../../lib/smsClient";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";
const ADMIN_PHONE = process.env.ADMIN_PHONE || "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { reference, userId, amount } = req.body;
  if (!reference || typeof reference !== "string") {
    return res.status(400).json({ error: "Missing transaction reference" });
  }

  try {
    // 1️⃣ Verify payment with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    });
    const result = await response.json();

    if (result.status !== true || result.data.status !== "success") {
      return res.status(400).json({ error: "Payment not verified" });
    }

    const email = result.data.customer.email;
    const paidAmount = result.data.amount / 100; // pesewas → GHS

    // 2️⃣ Prevent double-processing
    const { data: existing } = await supabaseAdmin
      .from("transactions")
      .select("id")
      .eq("reference", reference)
      .maybeSingle();

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Transaction already processed",
      });
    }

    // 3️⃣ Get user profile (by email or fallback userId)
    let { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, wallet, phone")
      .eq("email", email)
      .maybeSingle();

    if (!profile && userId) {
      const { data: byId } = await supabaseAdmin
        .from("profiles")
        .select("id, wallet, phone")
        .eq("id", userId)
        .single();
      profile = byId;
    }

    if (!profile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const newBalance = (profile.wallet || 0) + paidAmount;

    // 4️⃣ Atomic update
    const { error: txError } = await supabaseAdmin.rpc("deposit_and_log", {
      ref: reference,
      user_email: email,
      amount: paidAmount,
    });

    if (txError) {
      console.error("Atomic deposit error:", txError);
      return res.status(500).json({ error: "Failed to complete deposit" });
    }

    // 5️⃣ Notify via SMS
    if (profile.phone) {
      await notifyUserAndAdmin(
        profile.phone,
        `Deposit successful ✅ GHS ${paidAmount}. New balance: GHS ${newBalance}`
      );
    }
    if (ADMIN_PHONE) {
      await notifyUserAndAdmin(
        ADMIN_PHONE,
        `New deposit by ${email}: GHS ${paidAmount}. Balance: GHS ${newBalance}`
      );
    }

    return res.status(200).json({ success: true, email, paidAmount, newBalance });
  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
