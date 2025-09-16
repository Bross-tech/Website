import { useUser } from "@supabase/auth-helpers-react";
import { useComplaints } from "@/hooks/useComplaints";
import { useState } from "react";

export default function ComplaintsPage() {
  const user = useUser();
  const { complaints, addComplaint } = useComplaints(user?.id || null);

  const [form, setForm] = useState({
    network: "",
    recipient_number: "",
    data_size: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addComplaint(form);
    setForm({ network: "", recipient_number: "", data_size: "" });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Report Issue</h1>
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <select
          className="border p-2 w-full rounded"
          value={form.network}
          onChange={(e) => setForm({ ...form, network: e.target.value })}
          required
        >
          <option value="">Select Network</option>
          <option value="MTN">MTN</option>
          <option value="AirtelTigo">AirtelTigo</option>
          <option value="Vodafone">Vodafone</option>
        </select>
        <input
          type="text"
          placeholder="Recipient Number"
          className="border p-2 w-full rounded"
          value={form.recipient_number}
          onChange={(e) =>
            setForm({ ...form, recipient_number: e.target.value })
          }
          required
        />
        <input
          type="text"
          placeholder="Data Size"
          className="border p-2 w-full rounded"
          value={form.data_size}
          onChange={(e) => setForm({ ...form, data_size: e.target.value })}
          required
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Submit Complaint
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-2">My Complaints</h2>
      <ul className="space-y-2">
        {complaints.map((c) => (
          <li
            key={c.id}
            className="border p-3 rounded bg-gray-50 flex justify-between"
          >
            <div>
              <p className="font-medium">{c.network} - {c.data_size}</p>
              <p className="text-sm text-gray-600">To: {c.recipient_number}</p>
              <p className="text-xs text-gray-500">Status: {c.status}</p>
            </div>
            <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
