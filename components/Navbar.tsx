"use client";

import { useCart } from "@/contexts/CartContext";

export default function Navbar() {
  const { cart, toggleCart } = useCart();

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 24px",
        background: "#059669",
        color: "white",
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: "18px" }}>My Shop</div>

      <div style={{ position: "relative", cursor: "pointer" }} onClick={toggleCart}>
        🛒
        {cart.length > 0 && (
          <span
            style={{
              position: "absolute",
              top: -8,
              right: -8,
              background: "red",
              color: "white",
              borderRadius: "50%",
              padding: "2px 6px",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            {cart.length}
          </span>
        )}
      </div>
    </nav>
  );
}
