import { useCart } from "../context/CartContext";
import { supabase } from "@/lib/supabaseClient";

export default function Cart({ userId }: { userId: string }) {
  const { items, clearCart } = useCart();
  const total = items.reduce((s, i) => s + i.bundle.priceGhs, 0);

  const handleCheckout = async () => {
    if (!userId) return alert("Login required");

    // check wallet balance
    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (!wallet || wallet.balance < total) {
      return alert("Insufficient wallet balance");
    }

    // deduct wallet + create orders
    const { error: deductErr } = await supabase.rpc("deduct_wallet", {
      p_user_id: userId,
      p_amount: total,
    });
    if (deductErr) return alert("Error deducting balance");

    for (const it of items) {
      await supabase.from("orders").insert({
        user_id: userId,
        bundle: it.bundle,
        recipient: it.recipient,
        status: "Pending",
      });
    }

    alert("Order placed!");
    clearCart();
  };

  return (
    <div className="fixed right-4 bottom-4 w-72 rounded-xl p-4 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-lg">
      <div className="flex justify-between items-center">
        <strong>Cart</strong>
        <span>{items.length}</span>
      </div>

      <ul className="mt-2 max-h-40 overflow-y-auto text-sm">
        {items.map((it, idx) => (
          <li key={idx} className="mb-1">
            {it.bundle.network} — {it.bundle.size} — {it.recipient} — GHS{" "}
            {it.bundle.priceGhs.toFixed(2)}
          </li>
        ))}
      </ul>

      <div className="mt-3 flex justify-between items-center">
        <strong>Total: GHS {total.toFixed(2)}</strong>
        <button
          className="bg-white text-emerald-600 px-3 py-1 rounded hover:bg-gray-100"
          onClick={handleCheckout}
        >
          Pay
        </button>
      </div>
    </div>
  );
}
