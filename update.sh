#!/bin/bash
set -e
cd ~/Website

# --- components/Navbar.tsx ---
mkdir -p components
cat > components/Navbar.tsx << 'EOF'
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
        Cart ({cart.length})
      </button>
    </nav>
  );
}
EOF

# --- components/Bundles.tsx ---
cat > components/Bundles.tsx << 'EOF'
"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";

export type Bundle = { id: string; network: string; size: string; priceGhs: number };

export const bundles: Bundle[] = [
  { id: "mtn-1gb", network: "MTN", size: "1GB", priceGhs: 5 },
  { id: "mtn-2gb", network: "MTN", size: "2GB", priceGhs: 10 },
  { id: "mtn-3gb", network: "MTN", size: "3GB", priceGhs: 15 },
  { id: "tigo-1gb", network: "TIGO", size: "1GB", priceGhs: 4.8 },
];

export default function Bundles() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("asc");
  const { addToCart } = useCart();

  const list = bundles
    .filter((b) =>
      `${b.network} ${b.size}`.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, z) =>
      sort === "asc" ? a.priceGhs - z.priceGhs : z.priceGhs - a.priceGhs
    );

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <input
          placeholder="Search bundles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, padding: 6 }}
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          style={{ marginLeft: 8, padding: 6 }}
        >
          <option value="asc">Lowest → Highest</option>
          <option value="desc">Highest → Lowest</option>
        </select>
      </div>

      <ul style={{ marginTop: 12, padding: 0, listStyle: "none" }}>
        {list.map((b) => (
          <li key={b.id} style={{ marginBottom: 12 }}>
            <strong>{b.network}</strong> — {b.size} — GHS {b.priceGhs.toFixed(2)}
            <div style={{ marginTop: 6 }}>
              <button
                style={{
                  background: "#059669",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
                onClick={() => {
                  const recipient = prompt("Enter recipient number");
                  if (recipient) addToCart(b, recipient);
                }}
              >
                Add to Cart ➕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
EOF

# --- components/CartWidget.tsx ---
cat > components/CartWidget.tsx << 'EOF'
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
EOF

# --- contexts/CartContext.tsx ---
mkdir -p contexts
cat > contexts/CartContext.tsx << 'EOF'
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Bundle } from "@/components/Bundles";

type CartItem = {
  bundle: Bundle;
  recipient: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (bundle: Bundle, recipient: string) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  toggleCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = (bundle: Bundle, recipient: string) => {
    if (cart.some((c) => c.recipient === recipient && c.bundle.id === bundle.id)) {
      alert("This recipient already has that bundle in the cart!");
      return;
    }
    setCart((prev) => [...prev, { bundle, recipient }]);
    setIsOpen(true);
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => setCart([]);

  const toggleCart = () => setIsOpen((o) => !o);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, isOpen, toggleCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
EOF

# --- pages/index.tsx ---
mkdir -p pages
cat > pages/index.tsx << 'EOF'
"use client";

import Navbar from "@/components/Navbar";
import Bundles from "@/components/Bundles";
import CartWidget from "@/components/CartWidget";
import { CartProvider } from "@/contexts/CartContext";

export default function HomePage() {
  return (
    <CartProvider>
      <Navbar />
      <main style={{ padding: 16 }}>
        <Bundles />
      </main>
      <CartWidget />
    </CartProvider>
  );
}
EOF

# --- Git Commit ---
git add .
git commit -m "Update Navbar, Bundles, CartWidget, CartContext, and index"
git push
