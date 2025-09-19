"use client";

import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { items, toggleCart } = useCart();

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        background: "#111827",
        color: "white",
      }}
    >
      <h1 style={{ margin: 0 }}>Bundle Shop</h1>
      <button
        onClick={toggleCart}
        style={{
          position: "relative",
          background: "#059669",
          color: "white",
          border: "none",
          padding: "6px 12px",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Cart ({items.length})
      </button>
    </nav>
  );
}
