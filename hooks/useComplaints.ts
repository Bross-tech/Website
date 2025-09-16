import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useComplaints(userId: string | null) {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchComplaints = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("approvals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) console.error("Error fetching complaints:", error);
      else setComplaints(data || []);
      setLoading(false);
    };

    fetchComplaints();
  }, [userId]);

  const addComplaint = async (complaint: {
    network: string;
    recipient_number: string;
    data_size: string;
  }) => {
    if (!userId) return;
    const { data, error } = await supabase.from("approvals").insert([
      {
        ...complaint,
        user_id: userId,
      },
    ]);
    if (error) console.error("Error adding complaint:", error);
    else setComplaints([...(data || []), ...complaints]);
  };

  return { complaints, loading, addComplaint };
}
