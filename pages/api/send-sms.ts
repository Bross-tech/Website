// pages/api/send-sms.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const AT_USERNAME = process.env.AT_USERNAME; // Africa's Talking username
const AT_API_KEY = process.env.AT_API_KEY;   // Africa's Talking API key

type Data = {
  success: boolean;
  message: string;
  error?: any;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ success: false, message: "Missing 'to' or 'message'" });
  }

  try {
    const response = await axios.post(
      "https://api.africastalking.com/version1/messaging",
      new URLSearchParams({
        username: AT_USERNAME!,
        to,
        message,
        from: "YOUR_ALPHANUMERIC_ID", // replace with your Africa's Talking sender ID
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "apiKey": AT_API_KEY!,
        },
      }
    );

    return res.status(200).json({ success: true, message: "SMS sent", error: response.data });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to send SMS", error: err });
  }
}
