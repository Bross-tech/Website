// components/PaystackButton.tsx
import React from "react";
<<<<<<< HEAD

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
=======
const PaystackButton = () => <button>Pay with Paystack</button>;
export { PaystackButton };
>>>>>>> c81c701 (Fix Supabase user type issues, cleanup lockfiles, successful build)
