import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function AfaPage() {
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [location, setLocation] = useState("");
  const [dob, setDob] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    // ✅ basic validation
    if (!fullName || !mobile || !location || !dob || !nationalId) {
      alert("Please fill in all fields.");
      return;
    }

    setProcessing(true);

    // get user
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      alert("Please login.");
      setProcessing(false);
      return;
    }

    // get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("role,wallet")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "user";
    const fee = role === "agent" ? 6 : 8;

    // check wallet balance
    if (Number(profile?.wallet ?? 0) < fee) {
      alert("Insufficient wallet balance. Please top-up.");
      setProcessing(false);
      return;
    }

    try {
      // register record to 'approvals'
      await supabase.from("approvals").insert([{
        description: `AFA reg for ${fullName} (${mobile})`,
        full_name: fullName,
        mobile,
        location,
        dob,
        national_id: nationalId,
        user_id: user.id
      }]);

      // reduce wallet via RPC
      try {
        await supabase.rpc("decrement_wallet", {
          user_id_input: user.id,
          amount_input: fee,
        });
      } catch (err) {
        console.error("Wallet decrement failed:", err);
      }

      alert("AFA application submitted. Admin will review.");
      router.push("/dashboard");
    } catch (err: any) {
      alert("Error: " + (err.message || err));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="card max-w-md mx-auto bg-white shadow-md rounded-md p-6">
        <h2 className="text-xl font-semibold mb-4">AFA Registration</h2>

        <input
          className="input mb-3"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          className="input mb-3"
          placeholder="Mobile number"
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
          className="input mb-3"
          type="date"
          placeholder="Date of Birth"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
        />

        <input
          className="input mb-4"
          placeholder="National ID / Voter ID"
          value={nationalId}
          onChange={(e) => setNationalId(e.target.value)}
        />

        <button
          className="btn w-full"
          onClick={handleRegister}
          disabled={processing}
        >
          {processing ? "Processing..." : "Register & Pay via wallet"}
        </button>
      </div>
    </div>
  );
}
