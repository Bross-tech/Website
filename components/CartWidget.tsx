"use client";

import { useCart } from "@/contexts/CartContext";
import { useEffect } from "react";

export default function CartWidget() {
  const { cart, removeFromCart, clearCart, isOpen, toggleCart } = useCart();
  const total = cart.reduce((s, c) => s + c.bundle.priceGhs, 0);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleCart();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, toggleCart]);

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

        <div style={{ flex: 1, overflowY: "auto" }}>
          {cart.length === 0 ? (
            <p style={{ opacity: 0.6 }}>Your cart is empty</p>
          ) : (
            <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
              {cart.map((c, i) => (
                <li
                  key={i}
                  style={{
                    marginBottom: 10,
                    borderBottom: "1px solid #eee",
                    paddingBottom: 8,
                  }}
                >
                  <div>
                    <strong>{c.bundle.network}</strong> — {c.bundle.size}
                  </div>
                  <div>Recipient: {c.recipient}</div>
                  <div>GHS {c.bundle.priceGhs.toFixed(2)}</div>
                  <button
                    onClick={() => removeFromCart(i)}
                    style={{
                      marginTop: 4,
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
              onClick={() => alert("Proceed to Paystack flow (implement API)")}
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
