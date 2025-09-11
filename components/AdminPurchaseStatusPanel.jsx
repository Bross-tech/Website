import { useState } from "react";
import { StatusBadge } from "./StatusBadge";

export function AdminPurchaseStatusPanel({ purchases, onStatusUpdated }) {
  const [loadingId, setLoadingId] = useState(null);

  const handleStatusChange = async (id, newStatus) => {
    setLoadingId(id);
    const res = await fetch("/api/update-purchase-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purchaseId: id, newStatus }),
    });
    setLoadingId(null);
    if (res.ok) {
      onStatusUpdated && onStatusUpdated();
      alert("Status updated!");
    } else {
      alert("Failed to update status");
    }
  };

  return (
    <div>
      <h2 className="font-bold text-lg mb-4">Purchase Status Admin Panel</h2>
      <ul>
        {purchases.map((p) => (
          <li key={p.id} className="flex items-center gap-2 py-2 border-b">
            <span>
              {p.network} - {p.bundle} - GHS {p.price.toFixed(2)}
            </span>
            <StatusBadge status={p.status} />
            <select
              value={p.status}
              onChange={(e) => handleStatusChange(p.id, e.target.value)}
              disabled={loadingId === p.id}
              className="ml-2 border rounded p-1"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="delivered">Delivered</option>
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}
