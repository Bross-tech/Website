"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Wallet({ userId }: { userId: string }) {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", userId)
        .single();
      setBalance(data?.balance || 0);
    })();
  }, [userId]);

  const handleDeposit = () => {
    const amount = prompt("Enter deposit amount (GHS)");
    if (!amount) return;

    const paystack = (window as any).PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
      email: "user@example.com", // replace with user email
      amount: Number(amount) * 100,
      currency: "GHS",
      callback: async (response: any) => {
        // update wallet balance in supabase
        await supabase.rpc("deposit_to_wallet", {
          p_user_id: userId,
          p_amount: Number(amount),
        });
        alert("Deposit successful!");
        location.reload();
      },
      onClose: () => alert("Transaction closed"),
    });
    paystack.openIframe();
  };

  return (
    <div className="bg-white shadow-md p-4 rounded-lg flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold">Wallet Balance</h3>
        <p className="text-xl font-bold text-green-600">GHS {balance.toFixed(2)}</p>
      </div>
      <button
        onClick={handleDeposit}
        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
      >
        + Deposit
      </button>
    </div>
  );
      }
