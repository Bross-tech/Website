"use client";

import { useCart } from "@/context/CartContext";

interface NavbarProps {
  userId: string | null;
  role: "customer" | "agent" | "admin" | null;
  wallet: number;
}

export default function Navbar({ userId, role, wallet }: NavbarProps) {
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
        {userId ? (
          <>
            <span>
              Role: <strong>{role}</strong>
            </span>
            <span>
              Wallet: <strong>GHS {wallet.toFixed(2)}</strong>
            </span>
          </>
        ) : (
          <button
            onClick={() => (window.location.href = "/login")}
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
