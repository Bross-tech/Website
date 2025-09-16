import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const AT_USERNAME = process.env.AT_USERNAME || "";
const AT_API_KEY = process.env.AT_API_KEY || "";
const AT_SENDER_NAME = process.env.AT_SENDER_NAME || "Datastore4gh";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).send({ success: false });
  const { to, message } = req.body;
  if (!to || !message) return res.status(400).send({ success: false, message: "Missing" });

  try {
    const response = await axios.post(
      "https://api.africastalking.com/version1/messaging",
      new URLSearchParams({
        username: AT_USERNAME,
        to,
        message,
        from: AT_SENDER_NAME,
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded", apiKey: AT_API_KEY },
      }
    );
    res.status(200).json({ success: true, data: response.data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message ?? err });
  }
}
