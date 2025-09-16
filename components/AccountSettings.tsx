import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AccountSettings() {
  const [user, setUser] = useState<any | null>(null);
  const [phone, setPhone] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);

      if (data.user) {
        const { data: profile } = await supabase.from("profiles").select("phone").eq("id", data.user.id).single();
        setPhone(profile?.phone ?? "");
      }
    })();
  }, []);

  const updatePhone = async () => {
    if (!user) return;
    await supabase.from("profiles").upsert({ id: user.id, phone }).select();
    alert("Phone updated");
  };

  const changePassword = async () => {
    const email = user?.email;
    if (!email) return alert("No email known");
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) alert(error.message); else alert("Password reset link sent to your email");
  };

  if (!user) return <div>Please login</div>;

  return (
    <div style={{ padding: 12 }}>
      <h3>Account</h3>
      <div>Email: {user.email}</div>
      <div style={{ marginTop: 8 }}>
        Phone: <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button onClick={updatePhone} style={{ marginLeft: 8 }}>Save</button>
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={changePassword}>Reset Password</button>
      </div>
    </div>
  );
}
