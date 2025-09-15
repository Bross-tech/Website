// components/PaystackButton.tsx
import React from "react";
import { PaystackButton } from "react-paystack";

type PaymentButtonProps = {
  amount: number; // amount in GHS
  email: string;
  reference?: string;
  onSuccess: (reference: any) => void;
  onClose?: () => void;
};

const PaystackPaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  email,
  reference,
  onSuccess,
  onClose,
}) => {
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

  const config = {
    reference: reference || new Date().getTime().toString(),
    email,
    amount: amount * 100, // convert GHS → pesewas
    publicKey,
    currency: "GHS",
  };

  const componentProps = {
    ...config,
    text: "Pay Now",
    onSuccess,
    onClose,
  };

  return <PaystackButton {...componentProps} />;
};

export default PaystackPaymentButton;
