// pages/api/paystack/verify.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseAdminClient } from "../../../lib/supabaseClient";

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
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
      },
    });

    const result = await response.json();
    if (result.status !== true || result.data.status !== "success") {
      return res.status(400).json({ error: "Payment not verified" });
    }

    // 2️⃣ Extract user + amount
    const email = result.data.customer.email;
    const paidAmount = result.data.amount / 100; // kobo → naira/cedis

    const supabaseAdmin = createSupabaseAdminClient();

    // 3️⃣ Check if transaction already processed
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

    // 4️⃣ Fetch current wallet
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("wallet")
      .eq("email", email)
      .single();

    if (fetchError || !profile) {
      return res.status(500).json({ error: "User not found" });
    }

    const newBalance = (profile.wallet || 0) + paidAmount;

    // 5️⃣ Update wallet balance
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ wallet: newBalance })
      .eq("email", email);

    if (updateError) {
      return res.status(500).json({ error: "Failed to update wallet" });
    }

    // 6️⃣ Record transaction to prevent double-crediting
    const { error: txError } = await supabaseAdmin
      .from("transactions")
      .insert([
        {
          reference,
          email,
          amount: paidAmount,
          status: "success",
        },
      ]);

    if (txError) {
      console.error("Transaction log error:", txError);
    }

    return res.status(200).json({
      success: true,
      email,
      paidAmount,
      newBalance,
    });
  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
