import React from "react";

interface PaystackButtonProps {
  userId: string;
  amount: number;
  email: string;
  onSuccess: (newBalance: number) => void;
}

export const PaystackButton: React.FC<PaystackButtonProps> = ({
  userId,
  amount,
  email,
  onSuccess,
}) => {
  const handlePayment = async () => {
    try {
      const handler = (window as any).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email,
        amount: amount * 100, // Paystack expects kobo (GHS * 100)
        callback: async function (response: any) {
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
            // ✅ Use balance returned from backend
            onSuccess(data.newBalance);
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
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition w-full"
    >
      Deposit GHS {amount}
    </button>
  );
};
