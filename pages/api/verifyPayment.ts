import type { NextApiRequest, NextApiResponse } from "next";

// Example payment verification handler
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { reference } = req.body;

    // TODO: Call Paystack/Flutterwave API here to verify payment
    // Example response (mock):
    const paymentStatus = {
      success: true,
      reference,
      message: "Payment verified successfully",
    };

    return res.status(200).json(paymentStatus);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
