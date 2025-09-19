// components/Bundles.tsx
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";   // ✅ fixed: singular "context"
import { supabase } from "@/lib/supabaseClient";

export type Bundle = {
  id: string;
  network: string;
  size: string;
  priceGhs: number;
};

export default function Bundles() {
  const { addToCart } = useCart();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBundles = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("bundles")
        .select("id, network, size, priceGhs");

      if (error) {
        console.error("Error fetching bundles:", error.message);
      } else {
        setBundles(data || []);
      }
      setLoading(false);
    };

    fetchBundles();
  }, []);

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

  if (loading) {
    return <p className="p-6 text-center">Loading bundles...</p>;
  }

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
        {list.map((b) => (
          <li
            key={b.id}
            className="flex justify-between items-center p-3 border rounded"
          >
            <div>
              <strong>{b.network}</strong> — {b.size} — GHS{" "}
              {b.priceGhs.toFixed(2)}
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

      {list.length === 0 && (
        <p className="text-center text-gray-500 mt-4">No bundles found.</p>
      )}
    </div>
  );
  }
