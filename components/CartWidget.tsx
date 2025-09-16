import { useState } from "react";
import type { Bundle } from "./Bundles";

export default function CartWidget() {
  const [cart, setCart] = useState<{ bundle: Bundle; recipient: string }[]>([]);

  // For demo, export setter on window (quick)
  // In real app use context or lifting state to pages.
  (window as any).__addToCart = (b: any) => {
    const recipient = prompt("Enter recipient number");
    if (!recipient) return;
    setCart((c) => [...c, { bundle: b, recipient }]);
  };

  const total = cart.reduce((s, c) => s + c.bundle.priceGhs, 0);

  return (
    <div style={{
      position: "fixed",
      right: 16,
      bottom: 16,
      width: 320,
      background: "rgba(5,150,105,0.95)",
      color: "white",
      padding: 12,
      borderRadius: 12,
      boxShadow: "0 6px 18px rgba(0,0,0,0.2)"
    }}>
      <h4 style={{ margin: 0 }}>Cart ({cart.length})</h4>
      <div style={{ fontSize: 12, opacity: 0.9 }}>Only recipient, size & cost shown</div>
      <ul>
        {cart.map((c, i) => (
          <li key={i}>
            {c.bundle.network} — {c.bundle.size} — {c.recipient} — GHS {c.bundle.priceGhs.toFixed(2)}
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 8 }}>
        <strong>Total: GHS {total.toFixed(2)}</strong>
      </div>
      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <button onClick={() => alert("Proceed to Paystack flow (implement API)")}>Pay Now</button>
      </div>
    </div>
  );
}
