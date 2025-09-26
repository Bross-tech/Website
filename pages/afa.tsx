// pages/afa-registration.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function AfaPage() {
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [location, setLocation] = useState("");
  const [dob, setDob] = useState("");
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!fullName || !mobile || !location || !dob) {
      toast.error("Please fill in all fields.");
      return;
    }

    setProcessing(true);

    // 1️⃣ Get current user
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      toast.error("You must be logged in.");
      setProcessing(false);
      return;
    }

    // 2️⃣ Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role,wallet")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      toast.error("Failed to fetch profile.");
      setProcessing(false);
      return;
    }

    const role = profile.role ?? "user";
    const fee = role === "agent" ? 6 : 8;

    if ((profile.wallet ?? 0) < fee) {
      toast.error("Insufficient wallet balance. Please top up.");
      setProcessing(false);
      return;
    }

    try {
      // 3️⃣ Insert into approvals table
      await supabase.from("approvals").insert([
        { description: `AFA registration for ${fullName} (${mobile})` },
      ]);

      // 4️⃣ Deduct wallet via RPC
      const { error: rpcError } = await supabase.rpc("decrement_wallet", {
        user_id_input: user.id,
        amount_input: fee,
      });

      if (rpcError) {
        toast.error("Failed to deduct wallet balance.");
        setProcessing(false);
        return;
      }

      toast.success("AFA application submitted. Admin will review.");
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error("Something went wrong. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-md mx-auto bg-white shadow-md rounded-md p-6">
        <h2 className="text-xl font-semibold mb-4">AFA Registration</h2>

        <input
          className="input mb-3"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <input
          className="input mb-3"
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />
        <input
          className="input mb-3"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          className="input mb-4"
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
        />

        <button
          className="btn w-full"
          onClick={handleRegister}
          disabled={processing}
        >
          {processing ? "Processing..." : `Register & Pay GHS ${profile?.role === "agent" ? 6 : 8}`}
        </button>
      </div>
    </div>
  );
                                                                }
