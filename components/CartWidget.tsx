"use client";

import { useCart } from "@/context/CartContext";

export default function CartWidget() {
  const { items, removeFromCart, clearCart, isOpen, toggleCart } = useCart();

  const total = items.reduce((sum, c) => sum + Number(c.price ?? 0), 0);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={toggleCart}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full shadow-lg"
      >
        🛒 {items.length}
      </button>

      {isOpen && (
        <div className="mt-2 bg-white shadow-lg p-4 rounded-xl border w-80">
          <h2 className="text-lg font-bold mb-2">Your Cart</h2>

          {items.length === 0 ? (
            <p className="text-gray-500">Cart is empty.</p>
          ) : (
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {items.map((c, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center text-sm border-b pb-1"
                >
                  <div>
                    <div>
                      {c.bundle.network} {c.bundle.size}
                    </div>
                    <div className="text-xs text-gray-500">To: {c.recipient}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="font-semibold">
                      GHS {c.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(i)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="flex justify-between items-center mt-3 font-bold">
            <span>Total:</span>
            <span>GHS {total.toFixed(2)}</span>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={clearCart}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-black px-3 py-1 rounded"
            >
              Clear
            </button>
            <button
              onClick={() => alert("Checkout not implemented yet")}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded"
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
