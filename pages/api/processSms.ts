import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabaseClient";

// Africa's Talking setup
const username = process.env.AT_USERNAME!;
const apiKey = process.env.AT_API_KEY!;
const africastalking = require("africastalking")({ apiKey, username });
const sms = africastalking.SMS;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1. Fetch all pending SMS
    const { data: pendingSms, error } = await supabase
      .from("sms_logs")
      .select("*")
      .eq("status", "pending");

    if (error) throw error;
    if (!pendingSms.length) return res.status(200).json({ message: "No pending SMS" });

    // 2. Loop through pending messages
    for (const smsLog of pendingSms) {
      try {
        await sms.send({
          to: smsLog.recipient,
          message: smsLog.message,
        });

        // 3. Update to sent
        await supabase
          .from("sms_logs")
          .update({ status: "sent" })
          .eq("id", smsLog.id);

      } catch (err: any) {
        // 3b. Update to failed
        await supabase
          .from("sms_logs")
          .update({ status: "failed", error: err.message })
          .eq("id", smsLog.id);
      }
    }

    res.status(200).json({ message: "Processed SMS queue" });

  } catch (err: any) {
    console.error("processSms error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
