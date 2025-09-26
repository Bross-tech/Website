// pages/api/paystack/verify.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "../../../lib/supabaseClient"; 
import { notifyUserAndAdmin } from "../../../lib/smsClient";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";
const ADMIN_PHONE = process.env.ADMIN_PHONE || ""; // ✅ notify admin too

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { reference } = req.query;
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

    // 2️⃣ Extract user + amount
    const email = result.data.customer.email;
    const paidAmount = result.data.amount / 100; // kobo → GHS

    // 3️⃣ Check if already processed
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

    // 4️⃣ Get user profile
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("wallet, phone")
      .eq("email", email)
      .single();

    if (fetchError || !profile) {
      return res.status(500).json({ error: "User not found" });
    }

    const newBalance = (profile.wallet || 0) + paidAmount;

    // 5️⃣ Atomic transaction (wallet update + log)
    const { error: txError } = await supabaseAdmin.rpc("deposit_and_log", {
      ref: reference,
      user_email: email,
      amount: paidAmount,
    });

    if (txError) {
      console.error("Atomic deposit error:", txError);
      return res.status(500).json({ error: "Failed to complete deposit" });
    }

    // 6️⃣ Send SMS to user + admin
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
