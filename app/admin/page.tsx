"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Approval = {
  id: string;
  full_name: string;
  mobile: string;
  location: string;
  dob: string;
  national_id: string;
  description: string;
  status: string; // pending | processing | completed
  created_at: string;
};

export default function AdminPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("approvals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching approvals:", error);
    } else {
      setApprovals(data as Approval[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("approvals")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert("Failed to update status: " + error.message);
    } else {
      fetchApprovals();
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Admin Panel – AFA Registrations</h1>

      {loading ? (
        <p>Loading...</p>
      ) : approvals.length === 0 ? (
        <p>No AFA registrations yet.</p>
      ) : (
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">Full Name</th>
              <th className="border p-2">Mobile</th>
              <th className="border p-2">Location</th>
              <th className="border p-2">DOB</th>
              <th className="border p-2">National ID</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {approvals.map((a) => (
              <tr key={a.id} className="text-center">
                <td className="border p-2">{a.full_name}</td>
                <td className="border p-2">{a.mobile}</td>
                <td className="border p-2">{a.location}</td>
                <td className="border p-2">{a.dob}</td>
                <td className="border p-2">{a.national_id}</td>
                <td className="border p-2 capitalize">{a.status ?? "pending"}</td>
                <td className="border p-2 flex gap-2 justify-center">
                  <button
                    onClick={() => updateStatus(a.id, "processing")}
                    className="px-2 py-1 bg-yellow-500 text-white rounded"
                  >
                    Processing
                  </button>
                  <button
                    onClick={() => updateStatus(a.id, "completed")}
                    className="px-2 py-1 bg-green-600 text-white rounded"
                  >
                    Completed
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
