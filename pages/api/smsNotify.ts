import type { NextApiRequest, NextApiResponse } from "next";
import Africastalking from "africastalking";

// Initialize Africa's Talking
const at = Africastalking({
  apiKey: process.env.AFRICAS_TALKING_API_KEY,
  username: process.env.AFRICAS_TALKING_USERNAME,
});

const sms = at.SMS;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = req.body;

    if (!data || !data.type) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    // --- Handle purchase notifications to admin ---
    if (data.type === "purchase") {
      const message = `New purchase: ${data.product_name || "Data/Service"} by ${data.user_email || "Unknown"}.\nAmount: ${data.amount || 0}.`;

      // Admin phone number (example: +233556429525)
      await sms.send({
        to: ["+233556429525"],
        message,
      });

      return res.status(200).json({ status: "Admin notified" });
    }

    // --- Handle deposit top-up notifications to user ---
    if (data.type === "deposit") {
      if (!data.user_phone || !data.amount) {
        return res.status(400).json({ error: "Missing user phone or amount" });
      }

      const message = `Hi! Your wallet has been topped up with ${data.amount}. New balance: ${data.new_balance || "N/A"}.`;

      await sms.send({
        to: [data.user_phone],
        message,
      });

      return res.status(200).json({ status: "User notified" });
    }

    return res.status(400).json({ error: "Unknown notification type" });
  } catch (error: any) {
    console.error("SMS notify error:", error);
    return res.status(500).json({ error: error.message || "SMS failed" });
  }
}
