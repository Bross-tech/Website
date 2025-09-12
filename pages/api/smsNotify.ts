import type { NextApiRequest, NextApiResponse } from "next";
import africastalking from "africastalking";
import { supabase } from "../../lib/supabaseClient";

// Setup Africa's Talking
const africasTalking = africastalking({
  apiKey: process.env.AT_API_KEY as string, // put in .env.local
  username: process.env.AT_USERNAME as string, // usually "sandbox" for testing
});

const sms = africasTalking.SMS;

// Fixed admin number (can also load from env if you prefer)
const ADMIN_PHONE = "+233556429525";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const purchase = req.body;

    if (!purchase || !purchase.id) {
      return res.status(400).json({ error: "Missing purchase details" });
    }

    // Craft message
    const message = `📦 New purchase received!\n\nID: ${purchase.id}\nUser: ${purchase.user_id}\nAmount: ${purchase.amount}\nDate: ${new Date().toLocaleString()}`;

    // Send SMS via Africa's Talking
    const response = await sms.send({
      to: [ADMIN_PHONE],
      message,
    });

    // Log SMS in Supabase
    await supabase.from("sms_logs").insert({
      recipient: ADMIN_PHONE,
      message,
      status: "SENT",
      error: null,
    });

    res.status(200).json({ success: true, response });
  } catch (error: any) {
    console.error("SMS sending failed:", error);

    // Log error in Supabase
    await supabase.from("sms_logs").insert({
      recipient: ADMIN_PHONE,
      message: "Failed to send purchase notification",
      status: "FAILED",
      error: error.message,
    });

    res.status(500).json({ error: "Failed to send SMS" });
  }
}
