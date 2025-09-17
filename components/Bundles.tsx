// components/Bundles.tsx
import { useState } from "react";
import { useCart } from "@/context/CartContext";

export type Bundle = {
  network: string;
  size: string;
  priceGhs: number;
};

const bundles: Bundle[] = [
  // --- MTN ---
  { network: "MTN", size: "1GB", priceGhs: 5.0 },
  { network: "MTN", size: "2GB", priceGhs: 10.0 },
  { network: "MTN", size: "3GB", priceGhs: 15.0 },
  { network: "MTN", size: "4GB", priceGhs: 20.0 },
  { network: "MTN", size: "5GB", priceGhs: 24.0 },
  { network: "MTN", size: "6GB", priceGhs: 28.0 },
  { network: "MTN", size: "7GB", priceGhs: 33.0 },
  { network: "MTN", size: "8GB", priceGhs: 36.0 },
  { network: "MTN", size: "10GB", priceGhs: 43.0 },
  { network: "MTN", size: "15GB", priceGhs: 66.0 },
  { network: "MTN", size: "20GB", priceGhs: 84.0 },
  { network: "MTN", size: "25GB", priceGhs: 104.0 },
  { network: "MTN", size: "30GB", priceGhs: 124.0 },
  { network: "MTN", size: "40GB", priceGhs: 159.0 },
  { network: "MTN", size: "50GB", priceGhs: 200.0 },
  { network: "MTN", size: "100GB", priceGhs: 379.0 },

  // --- TELECEL ---
  { network: "TELECEL", size: "5GB", priceGhs: 24.0 },
  { network: "TELECEL", size: "10GB", priceGhs: 41.0 },
  { network: "TELECEL", size: "15GB", priceGhs: 59.0 },
  { network: "TELECEL", size: "20GB", priceGhs: 79.0 },
  { network: "TELECEL", size: "25GB", priceGhs: 98.0 },
  { network: "TELECEL", size: "30GB", priceGhs: 111.0 },
  { network: "TELECEL", size: "40GB", priceGhs: 145.0 },
  { network: "TELECEL", size: "50GB", priceGhs: 186.0 },
  { network: "TELECEL", size: "100GB", priceGhs: 354.0 },

  // --- TIGO ISHARE ---
  { network: "TIGO-ISHARE", size: "1GB", priceGhs: 4.8 },
  { network: "TIGO-ISHARE", size: "2GB", priceGhs: 8.6 },
  { network: "TIGO-ISHARE", size: "3GB", priceGhs: 12.4 },
  { network: "TIGO-ISHARE", size: "4GB", priceGhs: 16.9 },
  { network: "TIGO-ISHARE", size: "5GB", priceGhs: 21.5 },
  { network: "TIGO-ISHARE", size: "6GB", priceGhs: 27.4 },
  { network: "TIGO-ISHARE", size: "7GB", priceGhs: 28.4 },
  { network: "TIGO-ISHARE", size: "8GB", priceGhs: 34.2 },
  { network: "TIGO-ISHARE", size: "9GB", priceGhs: 37.0 },
  { network: "TIGO-ISHARE", size: "10GB", priceGhs: 40.5 },

  // --- TOGO BIG-TIME ---
  { network: "TOGO BIG-TIME", size: "15GB", priceGhs: 56.3 },
  { network: "TOGO BIG-TIME", size: "20GB", priceGhs: 67.0 },
  { network: "TOGO BIG-TIME", size: "25GB", priceGhs: 72.2 },
  { network: "TOGO BIG-TIME", size: "30GB", priceGhs: 77.2 },
  { network: "TOGO BIG-TIME", size: "40GB", priceGhs: 87.2 },
  { network: "TOGO BIG-TIME", size: "50GB", priceGhs: 97.0 },
  { network: "TOGO BIG-TIME", size: "60GB", priceGhs: 137.2 },
  { network: "TOGO BIG-TIME", size: "100GB", priceGhs: 203.2 },
  { network: "TOGO BIG-TIME", size: "200GB", priceGhs: 375.2 },
];

export default function Bundles() {
  const { addToCart } = useCart();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("asc");

  const list = bundles
    .filter((b) =>
      `${b.network} ${b.size}`.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) =>
      sort === "asc" ? a.priceGhs - b.priceGhs : b.priceGhs - a.priceGhs
    );

  const handleAdd = (bundle: Bundle) => {
    const recipient = prompt("Enter recipient number (include country code)");
    if (!recipient) return;
    addToCart(bundle, recipient);
    alert("Added to cart!");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Available Bundles</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search bundles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border px-3 py-1 rounded"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "asc" | "desc")}
          className="border px-3 py-1 rounded"
        >
          <option value="asc">Price Low → High</option>
          <option value="desc">Price High → Low</option>
        </select>
      </div>

      <ul className="grid gap-3">
        {list.map((b, idx) => (
          <li
            key={idx}
            className="flex justify-between items-center p-3 border rounded"
          >
            <div>
              <strong>{b.network}</strong> — {b.size} — GHS {b.priceGhs.toFixed(2)}
            </div>
            <button
              onClick={() => handleAdd(b)}
              className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700"
            >
              Add
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
