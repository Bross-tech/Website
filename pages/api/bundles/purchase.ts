// pages/api/bundles/purchase.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseClient";   // ✅ fixed import
import { notifyUserAndAdmin } from "@/lib/smsClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, bundleId } = req.body;
  if (!email || !bundleId) return res.status(400).json({ error: "Missing fields" });

  try {
    // 1️⃣ Fetch bundle
    const { data: bundle, error: bundleError } = await supabaseAdmin
      .from("bundles")
      .select("*")
      .eq("id", bundleId)
      .single();

    if (bundleError || !bundle) {
      return res.status(400).json({ error: "Bundle not found" });
    }

    // 2️⃣ Fetch user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("wallet, phone")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      return res.status(400).json({ error: "User not found" });
    }

    // 3️⃣ Check balance
    if (profile.wallet < bundle.pricecustomer) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    const newBalance = profile.wallet - bundle.pricecustomer;

    // 4️⃣ Update wallet
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ wallet: newBalance })
      .eq("email", email);

    if (updateError) {
      return res.status(500).json({ error: "Failed to update wallet" });
    }

    // 5️⃣ Send SMS
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
