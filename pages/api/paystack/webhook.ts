// pages/api/paystack/webhook.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseAdminClient } from "@/lib/supabaseClient";
import crypto from "crypto";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";

export const config = {
  api: {
    bodyParser: false, // ✅ raw body needed for signature check
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    // ✅ Capture raw body for signature verification
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
      const amount = event.data.amount / 100; // convert kobo → GHS

      console.log(`✅ Payment success for ${email}, amount: ${amount}`);

      // ✅ Update wallet balance in Supabase
      const supabaseAdmin = createSupabaseAdminClient();

      const { data: user } = await supabaseAdmin
        .from("profiles")
        .select("wallet")
        .eq("email", email)
        .single();

      if (user) {
        const newBalance = (user.wallet || 0) + amount;

        await supabaseAdmin
          .from("profiles")
          .update({ wallet: newBalance })
          .eq("email", email);

        console.log(`💰 Wallet updated: ${email} → ${newBalance}`);
      } else {
        console.warn(`⚠️ No profile found for ${email}`);
      }
    }

    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error("Webhook error:", err.message);
    res.status(500).json({ error: "Webhook failed" });
  }
}
