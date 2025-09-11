import React from "react";

interface PaystackButtonProps {
  userId: string;
  amount: number; // in GHS
  email: string; // customer email
}

export const PaystackButton: React.FC<PaystackButtonProps> = ({
  userId,
  amount,
  email,
}) => {
  const handlePayment = async () => {
    try {
      if (!amount || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
      }

      const handler = (window as any).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY, // public key from env
        email,
        amount: amount * 100, // Paystack expects kobo
        callback: async function (response: any) {
          // Call backend to verify
          const res = await fetch("/api/verifyPayment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reference: response.reference,
              userId,
              amount,
            }),
          });

          const data = await res.json();
          if (data.success) {
            alert(`Payment of GHS ${amount} successful!`);
          } else {
            alert("Payment verification failed!");
          }
        },
        onClose: function () {
          alert("Payment cancelled.");
        },
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
