import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";
import { supabaseAdmin } from "../../lib/supabaseClient";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method === 'POST'){
    const { amount, email } = req.body;
    if(!amount || !email) return res.status(400).json({ error:'missing' });

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method:'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: Math.round(Number(amount) * 100),
        email,
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/paystack/verify`
      })
    });

    const data = await response.json();
    return res.status(200).json(data);
  }

  if(req.method === 'GET'){
    return res.status(200).json({ ok:true });
  }

  res.status(405).end();
}
