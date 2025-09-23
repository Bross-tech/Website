// pages/api/bundles/purchase.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseAdminClient } from "../../../lib/supabaseClient";
import { notifyUserAndAdmin } from "../../../lib/smsClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, bundleId } = req.body;
  if (!email || !bundleId) return res.status(400).json({ error: "Missing fields" });

  try {
    const supabaseAdmin = createSupabaseAdminClient();

    const { data: bundle } = await supabaseAdmin.from("bundles").select("*").eq("id", bundleId).single();
    if (!bundle) return res.status(400).json({ error: "Bundle not found" });

    const { data: profile } = await supabaseAdmin.from("profiles").select("wallet, phone").eq("email", email).single();
    if (!profile) return res.status(400).json({ error: "User not found" });

    if (profile.wallet < bundle.pricecustomer) return res.status(400).json({ error: "Insufficient funds" });

    const newBalance = profile.wallet - bundle.pricecustomer;

    await supabaseAdmin.from("profiles").update({ wallet: newBalance }).eq("email", email);

    // ✅ Send SMS
    if (profile.phone) {
      await notifyUserAndAdmin(
        profile.phone,
        `Bundle purchased: ${bundle.size} for GHS ${bundle.pricecustomer}. Balance: GHS ${newBalance}`
      );
    }

    return res.status(200).json({ success: true, newBalance });
  } catch (err) {
    console.error("Purchase error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
