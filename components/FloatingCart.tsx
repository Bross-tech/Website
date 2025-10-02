"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Fragment, useState } from "react";
import { Transition } from "@headlessui/react";
import { PaystackButton } from "react-paystack";

export default function FloatingCart() {
  const { items, isOpen, toggleCart, removeFromCart, clearCart } = useCart();
  const { walletBalance, userEmail, userId } = useAuth();
  const [isPaying, setIsPaying] = useState(false);

  const total = items.reduce((sum, item) => sum + item.price, 0);

  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email: userEmail,
    amount: total * 100,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
  };

  const handleWalletPayment = async () => {
    setIsPaying(true);
    try {
      const res = await fetch("/api/wallet/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount: total }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Payment successful! New wallet balance: GHS ${data.newBalance}`);
        clearCart();
      } else {
        alert(data.error || "Wallet payment failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error during wallet payment");
    }
    setIsPaying(false);
  };

  if (items.length === 0) return null;

  return (
    <>
      <button
        onClick={toggleCart}
        className="fixed bottom-5 right-5 z-50 bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-blue-700 transition flex items-center space-x-2"
      >
        <span>Cart</span>
        <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
          {items.length}
        </span>
      </button>

      <Transition
        as={Fragment}
        show={isOpen}
        enter="transform transition ease-in-out duration-300"
        enterFrom="translate-x-full"
        enterTo="translate-x-0"
        leave="transform transition ease-in-out duration-300"
        leaveFrom="translate-x-0"
        leaveTo="translate-x-full"
      >
        <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-40 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">My Cart</h2>
            <button onClick={toggleCart} className="text-gray-500 hover:text-gray-700 text-xl">
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-3">
              {items.map((item, i) => (
                <li key={i} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{item.bundle.name}</p>
                    <p className="text-sm text-gray-500">Network: {item.network}</p>
                    {item.subType && <p className="text-sm text-gray-500">Type: {item.subType}</p>}
                    <p className="text-sm text-gray-500">Size: {item.size}</p>
                    <p className="text-sm text-gray-500">Recipient: {item.recipient}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="font-medium">GHS {item.price}</p>
                    <button
                      onClick={() => removeFromCart(i)}
                      className="text-red-500 text-sm hover:underline mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 border-t flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Total:</span>
              <span className="font-bold text-gray-900">GHS {total}</span>
            </div>

            <div className="flex justify-between">
              <button
                onClick={clearCart}
                className="flex-1 mr-2 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
                disabled={isPaying}
              >
                Clear Cart
              </button>

              {walletBalance < total ? (
                <PaystackButton
                  {...paystackConfig}
                  text={isPaying ? "Processing..." : "Pay Now"}
                  className="flex-1 ml-2 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                  onSuccess={async (reference) => {
                    try {
                      const res = await fetch("/api/paystack/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ reference: reference.reference, userId, amount: total }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        alert(`Payment successful! New balance: GHS ${data.newBalance}`);
                        clearCart();
                      } else {
                        alert("Payment verification failed!");
                      }
                    } catch (err) {
                      console.error(err);
                      alert("Server error during payment verification");
                    }
                  }}
                  onClose={() => alert("Payment closed")}
                />
              ) : (
                <button
                  onClick={handleWalletPayment}
                  className="flex-1 ml-2 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                  disabled={isPaying}
                >
                  {isPaying ? "Processing..." : "Pay Now"}
                </button>
              )}
            </div>
          </div>
        </div>
      </Transition>
    </>
  );
}
