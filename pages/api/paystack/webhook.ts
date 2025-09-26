// pages/api/paystack/webhook.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { notifyUserAndAdmin } from "@/lib/smsClient";
import crypto from "crypto";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";
const ADMIN_PHONE = process.env.ADMIN_PHONE || ""; // notify admin too

export const config = {
  api: {
    bodyParser: false, // ✅ raw body required for Paystack signature check
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    // ✅ Capture raw body
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    const rawBody = Buffer.concat(chunks).toString("utf8");

    // ✅ Verify Paystack signature
    const signature = req.headers["x-paystack-signature"] as string;
    const expected = crypto
      .createHmac("sha512", PAYSTACK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (signature !== expected) {
      console.error("❌ Invalid Paystack signature");
      return res.status(400).json({ error: "Invalid signature" });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const email = event.data.customer.email;
      const amount = event.data.amount / 100; // kobo → GHS
      const reference = event.data.reference;

      console.log(`✅ Payment success for ${email}, amount: ${amount}, ref: ${reference}`);

      // 1️⃣ Guard against double-processing
      const { data: existing } = await supabaseAdmin
        .from("transactions")
        .select("id")
        .eq("reference", reference)
        .maybeSingle();

      if (existing) {
        console.warn(`⚠️ Transaction already processed: ${reference}`);
        return res.status(200).json({ received: true, duplicate: true });
      }

      // 2️⃣ Fetch user profile
      const { data: profile, error: fetchError } = await supabaseAdmin
        .from("profiles")
        .select("wallet, phone")
        .eq("email", email)
        .single();

      if (fetchError || !profile) {
        console.error(`❌ No profile found for ${email}`);
        return res.status(500).json({ error: "User not found" });
      }

      const newBalance = (profile.wallet || 0) + amount;

      // 3️⃣ Atomic transaction (wallet update + log)
      const { error: txError } = await supabaseAdmin.rpc("deposit_and_log", {
        ref: reference,
        user_email: email,
        amount,
      });

      if (txError) {
        console.error("Atomic deposit error:", txError);
        return res.status(500).json({ error: "Failed to complete deposit" });
      }

      // 4️⃣ Send SMS to user + admin
      if (profile.phone) {
        await notifyUserAndAdmin(
          profile.phone,
          `Deposit successful ✅ GHS ${amount}. New balance: GHS ${newBalance}`
        );
      }
      if (ADMIN_PHONE) {
        await notifyUserAndAdmin(
          ADMIN_PHONE,
          `New deposit by ${email}: GHS ${amount}. Balance: GHS ${newBalance}`
        );
      }
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error("Webhook error:", err.message);
    return res.status(500).json({ error: "Webhook failed" });
  }
}
