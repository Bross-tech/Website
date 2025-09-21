import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabaseClient";

export type Bundle = {
  id: string;
  network: string;
  size: string;
  priceAgent: number;
  priceCustomer: number;
};

type BundlesProps = {
  role?: "agent" | "customer";
};

export default function Bundles({ role = "customer" }: BundlesProps) {
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
        .select("id, network, size, priceAgent, priceCustomer");

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
    .sort((a, b) => {
      const priceA = role === "agent" ? a.priceAgent : a.priceCustomer;
      const priceB = role === "agent" ? b.priceAgent : b.priceCustomer;
      return sort === "asc" ? priceA - priceB : priceB - priceA;
    });

  const handleAdd = (bundle: Bundle) => {
    const recipient = prompt("Enter recipient number (include country code)");
    if (!recipient) return;
    const price = role === "agent" ? bundle.priceAgent : bundle.priceCustomer;
    addToCart({ ...bundle, priceGhs: price }, recipient);
    alert("Added to cart!");
  };

  if (loading) {
    return <p className="p-6 text-center">Loading bundles...</p>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Available Bundles for {role}
      </h1>

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
        {list.map((b) => {
          const price = role === "agent" ? b.priceAgent : b.priceCustomer;
          return (
            <li
              key={b.id}
              className="flex justify-between items-center p-3 border rounded"
            >
              <div>
                <strong>{b.network}</strong> — {b.size} — GHS{" "}
                {price.toFixed(2)}
              </div>
              <button
                onClick={() => handleAdd(b)}
                className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700"
              >
                Add
              </button>
            </li>
          );
        })}
      </ul>

      {list.length === 0 && (
        <p className="text-center text-gray-500 mt-4">No bundles found.</p>
      )}
    </div>
  );
}
