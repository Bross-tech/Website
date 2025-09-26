// lib/paystackClient.ts
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";

export async function verifyPaystackTransaction(reference: string) {
  if (!PAYSTACK_SECRET) {
    throw new Error("Missing PAYSTACK_SECRET_KEY in environment");
  }

  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  });

  if (!response.ok) {
    throw new Error(`Paystack API error: ${response.status}`);
  }

  const result = await response.json();
  return result;
}
