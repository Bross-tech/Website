import { useState } from "react";
import type { Bundle } from "./Bundles";

export default function Cart(){
  const [items, setItems] = useState<{bundle:Bundle, recipient:string}[]>([]);

  // expose quick add (used by Bundles page)
  (window as any).__cartAdd = (b: Bundle) => {
    const recipient = prompt("Enter recipient number (include country code)");
    if(!recipient) return;
    setItems(prev => [...prev, { bundle: b, recipient }]);
    alert("Added to cart");
  };

  const total = items.reduce((s,i)=> s + i.bundle.priceGhs, 0);

  return (
    <div style={{
      position:'fixed',
      right:18,
      bottom:18,
      width:280,
      borderRadius:12,
      padding:10,
      background:"linear-gradient(180deg,#10b981,#059669)",
      color:"#fff",
      boxShadow:"0 8px 30px rgba(0,0,0,0.18)"
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <strong>Cart</strong>
        <span>{items.length}</span>
      </div>
      <div style={{ fontSize:12, opacity:0.9 }}>Recipient, size & cost</div>
      <ul style={{ marginTop:8, maxHeight:160, overflowY:"auto" }}>
        {items.map((it, idx) => (
          <li key={idx} style={{ marginBottom:6 }}>
            {it.bundle.network} — {it.bundle.size} — {it.recipient} — GHS {it.bundle.priceGhs.toFixed(2)}
          </li>
        ))}
      </ul>
      <div style={{ marginTop:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <strong>Total: GHS {total.toFixed(2)}</strong>
        <button className="btn" onClick={() => alert("Implement checkout/Paystack flow")}>Pay</button>
      </div>
    </div>
  );
}
