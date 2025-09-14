// pages/api/verifyPayment.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { reference } = req.body;

      // Example verification logic (replace with Paystack or your logic)
      if (!reference) {
        return res.status(400).json({ success: false, message: "Reference required" });
      }

      // Call Paystack API or database here...

      return res.status(200).json({ success: true, message: "Payment verified" });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Error verifying payment" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
