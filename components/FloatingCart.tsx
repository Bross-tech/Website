"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Fragment, useState } from "react";
import { Transition } from "@headlessui/react";
import { PaystackButton } from "react-paystack";

// 🎨 Define network colors
const networkColors: Record<string, { bg: string; badge: string }> = {
  MTN: { bg: "bg-yellow-500 hover:bg-yellow-600 text-black", badge: "bg-black text-white" },
  Telecel: { bg: "bg-red-600 hover:bg-red-700 text-white", badge: "bg-white text-red-600" },
  Tigo: { bg: "bg-blue-700 hover:bg-blue-800 text-white", badge: "bg-white text-blue-700" },
  Airtel: { bg: "bg-black hover:bg-gray-900 text-white", badge: "bg-red-500 text-white" },
};

export default function FloatingCart() {
  const { items, isOpen, toggleCart, removeFromCart, clearCart } = useCart();
  const { walletBalance, userEmail, userId } = useAuth();
  const [isPaying, setIsPaying] = useState(false);

  const total = items.reduce((sum, item) => sum + item.price, 0);

  // Pick last network color (default MTN)
  const lastNetwork = items.length > 0 ? items[items.length - 1].bundle.network : "MTN";
  const colors = networkColors[lastNetwork] || networkColors["MTN"];

  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email: userEmail,
    amount: total * 100, // Paystack uses kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
  };

  // Wallet payment
  const handleWalletPayment = async () => {
    setIsPaying(true);
    try {
      const res = await fetch("/api/wallet/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount: total, items }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Payment successful! New wallet balance: GHS ${data.newBalance}`);
        clearCart();
      } else {
        alert(data.error || "Wallet payment failed");
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Server error during wallet payment");
    }
    setIsPaying(false);
  };

  if (items.length === 0) return null;

  return (
    <>
      {/* Floating Cart Button */}
      <button
        onClick={toggleCart}
        className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded-full shadow-lg transition flex items-center space-x-2 ${colors.bg}`}
      >
        <span>Cart</span>
        <span
          className={`rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold ${colors.badge}`}
        >
          {items.length}
        </span>
      </button>

      {/* Cart Sidebar */}
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
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">🛒 My Cart</h2>
            <button
              onClick={toggleCart}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-3">
              {items.map((item, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{item.bundle.name}</p>
                    <p className="text-sm text-gray-500">
                      Network: {item.bundle.network}
                    </p>
                    <p className="text-sm text-gray-500">
                      Size: {item.bundle.dataSize}
                    </p>
                    <p className="text-sm text-gray-500">
                      Recipient: {item.recipient}
                    </p>
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

          {/* Footer */}
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
                // Paystack Fallback
                <PaystackButton
                  {...paystackConfig}
                  text={isPaying ? "Processing..." : "Pay Now"}
                  className="flex-1 ml-2 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                  onSuccess={async (reference) => {
                    try {
                      const res = await fetch("/api/paystack/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          reference: reference.reference,
                          userId,
                          amount: total,
                          items,
                        }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        alert(`✅ Payment successful! New balance: GHS ${data.newBalance}`);
                        clearCart();
                      } else {
                        alert("⚠️ Payment verification failed!");
                      }
                    } catch (err) {
                      console.error(err);
                      alert("⚠️ Server error during payment verification");
                    }
                  }}
                  onClose={() => alert("Payment closed")}
                />
              ) : (
                // Wallet Payment
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
