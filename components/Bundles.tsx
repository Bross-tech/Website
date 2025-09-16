import { useState } from "react";

export type Bundle = { id:string; network:string; size:string; priceGhs:number };

const bundles: Bundle[] = [
  { id:'mtn-1gb', network:'MTN', size:'1GB', priceGhs:5 },
  { id:'mtn-2gb', network:'MTN', size:'2GB', priceGhs:10 },
  { id:'mtn-3gb', network:'MTN', size:'3GB', priceGhs:15 },
  { id:'tigo-1gb', network:'TIGO', size:'1GB', priceGhs:4.8 },
  // you can expand programmatically or seed to DB
];

export default function Bundles({ }: { onAdd?: (b:Bundle)=>void }){
  const [query,setQuery] = useState('');
  const [sort,setSort] = useState<'asc'|'desc'>('asc');

  const list = bundles.filter(b => (`${b.network} ${b.size}`).toLowerCase().includes(query.toLowerCase()))
                      .sort((a,z) => sort==='asc' ? a.priceGhs - z.priceGhs : z.priceGhs - a.priceGhs);

  return (
    <div className="card">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <input className="input" placeholder="Search bundles..." value={query} onChange={(e)=>setQuery(e.target.value)} style={{ flex:1 }} />
        <select value={sort} onChange={(e)=>setSort(e.target.value as any)} style={{ marginLeft:8 }}>
          <option value="asc">Lowest → Highest</option>
          <option value="desc">Highest → Lowest</option>
        </select>
      </div>

      <ul style={{ marginTop:12 }}>
        {list.map(b => (
          <li key={b.id} style={{ marginBottom:10 }}>
            <strong>{b.network}</strong> — {b.size} — GHS {b.priceGhs.toFixed(2)}
            <div style={{ marginTop:6 }}>
              <button className="btn" onClick={() => (window as any).__cartAdd?.(b)}>Add to Cart ➕</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
