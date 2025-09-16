"use client";

import Bundles, { bundles } from "@/components/Bundles";
import { useCart } from "@/contexts/CartContext";

export default function HomePage() {
  const { addToCart } = useCart();

  return (
    <div style={{ padding: 24 }}>
      <h1>Available Bundles</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {bundles.map((b, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #eee",
              borderRadius: 8,
              padding: 16,
              background: "#f9fafb",
            }}
          >
            <h3 style={{ margin: "0 0 8px 0" }}>{b.network}</h3>
            <p style={{ margin: "0 0 4px 0" }}>{b.size}</p>
            <p style={{ margin: "0 0 8px 0" }}>
              <strong>GHS {b.priceGhs.toFixed(2)}</strong>
            </p>
            <button
              style={{
                background: "#059669",
                color: "white",
                border: "none",
                borderRadius: 6,
                padding: "8px 12px",
                cursor: "pointer",
              }}
              onClick={() => {
                const recipient = prompt("Enter recipient number");
                if (recipient) addToCart(b, recipient);
              }}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
