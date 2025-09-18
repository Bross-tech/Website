"use client";

import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";

export default function CartWidget({ userId }: { userId: string }) {
  const { cart, removeFromCart, clearCart, isOpen, toggleCart } = useCart();
  const total = cart.reduce((s, c) => s + c.bundle.priceGhs, 0);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleCart();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, toggleCart]);

  // ✅ Checkout flow with Supabase
  const handleCheckout = async () => {
    if (!userId) {
      alert("Please login to checkout");
      return;
    }

    // 1. Get wallet balance
    const { data: wallet, error: walletErr } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (walletErr) {
      console.error(walletErr);
      alert("Error fetching wallet balance");
      return;
    }

    if (!wallet || wallet.balance < total) {
      alert("Insufficient wallet balance");
      return;
    }

    // 2. Deduct wallet balance (make sure `deduct_wallet` exists as RPC in Supabase)
    const { error: deductErr } = await supabase.rpc("deduct_wallet", {
      p_user_id: userId,
      p_amount: total,
    });

    if (deductErr) {
      console.error(deductErr);
      alert("Error deducting wallet balance");
      return;
    }

    // 3. Create orders
    const { error: orderErr } = await supabase.from("orders").insert(
      cart.map((c) => ({
        user_id: userId,
        network: c.bundle.network,
        bundle_size: c.bundle.size,
        price: c.bundle.priceGhs,
        recipient: c.recipient,
        status: "Pending",
      }))
    );

    if (orderErr) {
      console.error(orderErr);
      alert("Error creating orders");
      return;
    }

    alert("✅ Order placed successfully!");
    clearCart();
    toggleCart(); // close widget after success
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={toggleCart}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 999,
          }}
        />
      )}

      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100%",
          width: 320,
          background: "white",
          color: "black",
          padding: 16,
          boxShadow: "-4px 0 12px rgba(0,0,0,0.2)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease-in-out",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <h3 style={{ margin: 0 }}>Cart ({cart.length})</h3>
          <button
            onClick={toggleCart}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Cart Items */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {cart.length === 0 ? (
            <p style={{ opacity: 0.6 }}>Your cart is empty</p>
          ) : (
            <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
              {cart.map((c, i) => (
                <li
                  key={i}
                  style={{
                    marginBottom: 12,
                    padding: 10,
                    border: "1px solid #eee",
                    borderRadius: 8,
                    background: "#f9fafb",
                  }}
                >
                  <div>📶 <strong>{c.bundle.network}</strong></div>
                  <div>📦 {c.bundle.size}</div>
                  <div>👤 Recipient: {c.recipient}</div>
                  <div>💰 GHS {c.bundle.priceGhs.toFixed(2)}</div>
                  <button
                    onClick={() => removeFromCart(i)}
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      color: "red",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #ddd", paddingTop: 12 }}>
          <strong>Total: GHS {total.toFixed(2)}</strong>
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button
              style={{
                flex: 1,
                background: "#059669",
                color: "white",
                padding: "8px",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
              onClick={handleCheckout}
            >
              Pay Now
            </button>
            <button
              style={{
                background: "#f3f4f6",
                padding: "8px",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
              onClick={clearCart}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
