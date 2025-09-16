import { useState } from "react";

export type Bundle = {
  network: string;
  size: string;
  priceGhs: number;
  id: string;
};

const exampleBundles: Bundle[] = [
  { id: "mtn-1gb", network: "MTN", size: "1GB", priceGhs: 5 },
  { id: "mtn-2gb", network: "MTN", size: "2GB", priceGhs: 10 },
  { id: "tigo-1gb", network: "TIGO", size: "1GB", priceGhs: 4.8 },
  // add more or load from server
];

export default function Bundles({ onAdd }: { onAdd: (b: Bundle) => void }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("asc");

  const list = exampleBundles
    .filter((b) => `${b.network} ${b.size}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, z) => (sort === "asc" ? a.priceGhs - z.priceGhs : z.priceGhs - a.priceGhs));

  return (
    <div style={{ padding: 12 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input placeholder="Search bundles..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={sort} onChange={(e) => setSort(e.target.value as any)}>
          <option value="asc">Lowest → Highest</option>
          <option value="desc">Highest → Lowest</option>
        </select>
      </div>
      <ul>
        {list.map((b) => (
          <li key={b.id} style={{ marginBottom: 10 }}>
            <strong>{b.network}</strong> — {b.size} — GHS {b.priceGhs.toFixed(2)}
            <div style={{ marginTop: 6 }}>
              <button onClick={() => onAdd(b)} style={{ background: "green", color: "white", padding: "6px 10px", border: "none", borderRadius: 6 }}>
                Add to Cart ➕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
