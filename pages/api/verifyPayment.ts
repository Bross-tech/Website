import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({ error: "Missing transactionId" });
    }

    // Example: call your payment provider API
    const response = await fetch("https://api.paymentprovider.com/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PAYMENT_API_KEY}`,
      },
      body: JSON.stringify({ transactionId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: data.error || "Payment verification failed" });
    }

    // Success response
    return res.status(200).json({
      success: true,
      transactionId,
      status: data.status,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
