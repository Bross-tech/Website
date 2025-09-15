// components/PaystackButton.tsx
import React from "react";

type PaymentButtonProps = {
  amount: number;
  onPay: () => void;
};

export const PaymentButton: React.FC<PaymentButtonProps> = ({ amount, onPay }) => {
  return (
    <button
      onClick={onPay}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition w-full"
    >
      Deposit GHS {amount}
    </button>
  );
};
