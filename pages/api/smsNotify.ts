import type { NextApiRequest, NextApiResponse } from "next";
import africastalking from "africastalking";

// --- Setup Africa's Talking ---
const at = africastalking({
  apiKey: process.env.AT_API_KEY as string,
  username: process.env.AT_USERNAME as string,
});

// Use your sandbox or live SMS service
const sms = at.SMS;

// Hardcoded admin number (you can also move this to env vars later)
const ADMIN_NUMBER = "+233556429525";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { phone, amount, product } = req.body;

    if (!phone || !amount || !product) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const message = `New Purchase Alert 📢:
Product: ${product}
Amount: GHS ${amount}
Customer: ${phone}`;

    // Send SMS to the admin
    await sms.send({
      to: [ADMIN_NUMBER],
      message,
      from: process.env.AT_SHORTCODE || "", // optional: if you set an alphanumeric sender ID
    });

    return res.status(200).json({ success: true, message: "Admin notified via SMS" });
  } catch (error: any) {
    console.error("SMS Error:", error);
    return res.status(500).json({ error: "Failed to send SMS" });
  }
  }
