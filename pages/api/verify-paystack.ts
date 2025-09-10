import React from "react";

interface PaystackButtonProps {
  userId: number;
  amount: number; // in GHS
}

export const PaystackButton: React.FC<PaystackButtonProps> = ({ userId, amount }) => {
  const handlePayment = async () => {
    try {
      // Trigger your Paystack payment popup here
      // For example, using Paystack Inline
      const handler = (window as any).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY, // your public key
        email: "customer@example.com", // customer email
        amount: amount * 100, // Paystack expects kobo
        callback: async function (response: any) {
          // After payment, verify on backend
          const res = await fetch("/api/verifyPayment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reference: response.reference,
              userId,
              amount
            })
          });
          const data = await res.json();
          if (data.success) alert("Payment successful!");
          else alert("Payment verification failed!");
        },
        onClose: function () {
          alert("Payment cancelled.");
        }
      });
      handler.openIframe();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Something went wrong. Try again.");
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
    >
      Pay GHS {amount}
    </button>
  );
};
