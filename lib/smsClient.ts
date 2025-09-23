// lib/smsClient.ts
import AfricasTalking from "africastalking";

const AT = AfricasTalking({
  apiKey: process.env.AT_API_KEY || "",
  username: process.env.AT_USERNAME || "",
});

const sms = AT.SMS;

// ✅ Send SMS to customer + admin
export async function notifyUserAndAdmin(userPhone: string, message: string) {
  try {
    // Send to customer
    await sms.send({
      to: [userPhone],
      message,
      from: process.env.AT_SENDER_NAME || undefined,
    });

    // Send to admin (hardcode or load from env)
    if (process.env.ADMIN_PHONE) {
      await sms.send({
        to: [process.env.ADMIN_PHONE],
        message: `[ADMIN ALERT] ${message}`,
        from: process.env.AT_SENDER_NAME || undefined,
      });
    }
  } catch (err) {
    console.error("SMS sending error:", err);
  }
}
