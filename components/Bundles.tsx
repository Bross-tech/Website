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
