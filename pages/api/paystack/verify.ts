// pages/api/paystack/verify.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseAdminClient } from "../../../lib/supabaseClient";
import { notifyUserAndAdmin } from "../../../lib/smsClient"; // ✅ new import

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";

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
    const paidAmount = result.data.amount / 100; // convert from kobo/pesewas
    const supabaseAdmin = createSupabaseAdminClient();

    // 3️⃣ Prevent double-credit
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

    // 4️⃣ Get user profile (wallet + phone for SMS)
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("wallet, phone")
      .eq("email", email)
      .single();

    if (fetchError || !profile) {
      return res.status(500).json({ error: "User not found" });
    }

    const newBalance = (profile.wallet || 0) + paidAmount;

    // 5️⃣ Update wallet
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ wallet: newBalance })
      .eq("email", email);

    if (updateError) {
      return res.status(500).json({ error: "Failed to update wallet" });
    }

    // 6️⃣ Record transaction
    const { error: txError } = await supabaseAdmin.from("transactions").insert([
      {
        reference,
        email,
        amount: paidAmount,
        status: "success",
        created_at: new Date().toISOString(),
      },
    ]);

    if (txError) {
      console.error("Transaction log error:", txError);
    }

    // 7️⃣ Send SMS to user + admin
    if (profile.phone) {
      await notifyUserAndAdmin(
        profile.phone,
        `Deposit successful: GHS ${paidAmount}. New balance: GHS ${newBalance}`
      );
    }

    return res.status(200).json({ success: true, email, paidAmount, newBalance });
  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
