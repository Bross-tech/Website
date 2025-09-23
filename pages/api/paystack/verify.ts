import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "../../../lib/supabaseClient";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const { reference } = req.query;
  if (!reference || typeof reference !== "string") {
    return res.status(400).json({ error: "Missing payment reference" });
  }

  try {
    // Verify transaction with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    });

    const data = await response.json();
    if (!data.status || data.data.status !== "success") {
      return res.status(400).json({ error: "Payment verification failed", details: data });
    }

    const email = data.data.customer.email;
    const paidAmount = data.data.amount / 100; // convert from kobo

    // Update wallet balance
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ wallet: supabaseAdmin.rpc("increment_wallet", { amt: paidAmount }) })
      .eq("email", email);

    if (error) {
      console.error("Supabase error:", error.message);
      return res.status(500).json({ error: "Failed to update wallet" });
    }

    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    console.error("Paystack verify error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
}
