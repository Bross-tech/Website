// pages/api/bundles/purchase.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { notifyUserAndAdmin } from "@/lib/smsClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { email, bundleId } = req.body;
  if (!email || !bundleId)
    return res.status(400).json({ error: "Missing fields" });

  try {
    // 1️⃣ Call RPC for safe purchase (atomic in DB)
    const { data: purchaseResult, error: purchaseError } = await supabaseAdmin.rpc(
      "purchase_bundle", // 👈 you need this function in Supabase
      { p_email: email, p_bundle_id: bundleId }
    );

    if (purchaseError) {
      console.error("RPC error:", purchaseError);
      return res.status(400).json({ error: purchaseError.message });
    }

    // purchaseResult should include new_balance, bundle info, etc.
    const { new_balance, bundle, phone } = purchaseResult;

    // 2️⃣ Send SMS to user + admin
    if (phone) {
      await notifyUserAndAdmin(
        phone,
        `✅ Bundle purchased: ${bundle.size} for GHS ${bundle.pricecustomer}. New Balance: GHS ${new_balance}`
      );
    }

    return res.status(200).json({ success: true, newBalance: new_balance });
  } catch (err) {
    console.error("Purchase API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
