import type { NextApiRequest, NextApiResponse } from "next";
import africastalking from "africastalking";
import { supabase } from "../../lib/supabaseClient";

const africasTalking = africastalking({
  apiKey: process.env.AT_API_KEY as string,
  username: process.env.AT_USERNAME as string,
});

const sms = africasTalking.SMS;

const ADMIN_NUMBER = "+233556429525";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { phone, amount, data_plan, id } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Customer phone is required" });
    }

    const customerMessage = `Your purchase of ${data_plan} for GHS ${amount} was successful. Ref: ${id}.`;
    const adminMessage = `New order received!\nPlan: ${data_plan}\nAmount: GHS ${amount}\nCustomer: ${phone}\nRef: ${id}`;

    const recipients = [phone, ADMIN_NUMBER];
    const fullMessage = `${customerMessage}\n\n---\n${adminMessage}`;

    // Send SMS
    const response = await sms.send({
      to: recipients,
      message: fullMessage,
      from: process.env.AT_SENDER_ID || "DatastoreGH",
    });

    // Log SMS results to Supabase
    if (response.SMSMessageData && response.SMSMessageData.Recipients) {
      for (const r of response.SMSMessageData.Recipients) {
        await supabase.from("sms_logs").insert({
          recipient: r.number,
          message: fullMessage,
          status: r.status,
          error: r.status !== "Success" ? r.status : null,
        });
      }
    }

    return res.status(200).json({ success: true, msg: "SMS sent & logged" });
  } catch (error: any) {
    console.error("SMS error:", error);

    // Log failed SMS attempt
    await supabase.from("sms_logs").insert({
      recipient: ADMIN_NUMBER,
      message: "Failed to send SMS notification",
      status: "failed",
      error: error.message,
    });

    return res.status(500).json({ error: "Failed to send SMS", details: error.message });
  }
}
