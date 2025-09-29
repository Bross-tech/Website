import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseClient";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { reference, userId } = req.body;
  if (!reference || !userId) return res.status(400).json({ error: "Missing reference or userId" });

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    });
    const result = await response.json();

    if (!result.status || result.data.status !== "success")
      return res.status(400).json({ error: "Payment not verified" });

    // Upgrade user role
    const { error } = await supabaseAdmin.from("profiles").update({ role: "agent" }).eq("id", userId);
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
