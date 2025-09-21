"use client";

import { useCart } from "@/contexts/CartContext";

interface NavbarProps {
  user: any; // Replace 'any' with proper Supabase User type if desired
}

export default function Navbar({ user }: NavbarProps) {
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

      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {user ? (
          <span>Welcome, {user.email}</span>
        ) : (
          <button
            onClick={() => window.location.href = "/login"}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Login
          </button>
        )}

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
      </div>
    </nav>
  );
}
