// pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseAdminClient } from "@/lib/supabaseClient";
import { notifyUserAndAdmin } from "@/lib/smsClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, phone } = req.body;
  const supabaseAdmin = createSupabaseAdminClient();

  try {
    // Insert into profiles
    const { error } = await supabaseAdmin.from("profiles").insert([{ email, phone, wallet: 0 }]);
    if (error) throw error;

    // Send SMS
    if (phone) {
      await notifyUserAndAdmin(
        phone,
        `Welcome to DataStore4gh! Your account has been created successfully.`
      );
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Failed to register user" });
  }
}
