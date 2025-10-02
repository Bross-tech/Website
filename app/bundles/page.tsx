"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/context/CartContext";

type Bundle = {
  id: string;
  name: string;
  network: string; // MTN, TELECEL, TIGO_BIGTIME, TIGO_ISHARE
  price: number;
  size: string;
};

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchBundles = async () => {
      const { data, error } = await supabase
        .from("bundles")
        .select("*")
        .eq("type", "data"); // Only data bundles

      if (error) {
        console.error("Error fetching bundles:", error);
      } else {
        setBundles(data || []);
      }
      setLoading(false);
    };

    fetchBundles();
  }, []);

  // Group bundles by network
  const groupedBundles: Record<string, Bundle[]> = {};

  bundles.forEach((bundle) => {
    let key = bundle.network;

    // Split TIGO into BIG-TIME and ISHARE
    if (bundle.network === "TIGO") {
      if (bundle.name.toUpperCase().includes("BIG-TIME")) key = "TIGO BIG-TIME";
      else if (bundle.name.toUpperCase().includes("ISHARE")) key = "TIGO ISHARE";
    }

    if (!groupedBundles[key]) groupedBundles[key] = [];
    groupedBundles[key].push(bundle);
  });

  if (loading) return <p className="p-4">Loading bundles...</p>;

  return (
    <div className="p-6 space-y-8">
      {Object.keys(groupedBundles).map((network) => (
        <div key={network}>
          <h2 className="text-xl font-bold mb-4">{network}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {groupedBundles[network].map((bundle) => (
              <div key={bundle.id} className="p-4 rounded-lg shadow-md bg-white">
                <h3 className="text-lg font-bold mb-1">{bundle.name}</h3>
                <p className="text-gray-500 mb-1">Size: {bundle.size}</p>
                <p className="text-gray-800 font-semibold mb-2">GHS {bundle.price.toFixed(2)}</p>
                <button
                  onClick={() => {
                    const recipient = prompt("Enter recipient number (with country code)");
                    if (recipient) addToCart(bundle, recipient);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
