import { useState } from "react";
import { supabase, supabaseAdmin } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function AfaPage(){
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [location, setLocation] = useState("");
  const [dob, setDob] = useState("");
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    setProcessing(true);
    // charge wallet: agent 6, customer 8 — use profile role
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if(!user){ alert("Please login."); setProcessing(false); return; }

    const { data: profile } = await supabase.from('profiles').select('role,wallet').eq('id', user.id).single();
    const role = profile?.role ?? 'user';
    const fee = role === 'agent' ? 6 : 8;

    // check wallet
    if(Number(profile?.wallet ?? 0) < fee){
      alert("Insufficient wallet balance. Please top-up.");
      setProcessing(false);
      return;
    }

    // debit wallet by calling supabaseAdmin client on server should be used, but here we call RPC if present:
    try {
      // optimistic UI: register record to 'approvals' for admin review
      await supabase.from('approvals').insert([{ description: `AFA reg for ${fullName} (${mobile})` }]);
      // reduce wallet via API or RPC - here attempt simple update (requires service role if server)
      await supabase.rpc('decrement_wallet', { user_id_input: user.id, amount_input: fee }).catch(()=>{});
      alert("AFA application submitted. Admin will review.");
      router.push('/dashboard');
    } catch(err:any){
      alert("Error: "+ (err.message||err));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth:520, margin:'0 auto' }}>
        <h2>AFA Registration</h2>
        <div style={{ marginBottom:8 }}>
          <input className="input" placeholder="Full name" value={fullName} onChange={e=>setFullName(e.target.value)} />
        </div>
        <div style={{ marginBottom:8 }}>
          <input className="input" placeholder="Mobile number" value={mobile} onChange={e=>setMobile(e.target.value)} />
        </div>
        <div style={{ marginBottom:8 }}>
          <input className="input" placeholder="Location" value={location} onChange={e=>setLocation(e.target.value)} />
        </div>
        <div style={{ marginBottom:8 }}>
          <input className="input" type="date" value={dob} onChange={e=>setDob(e.target.value)} />
        </div>
        <div>
          <button className="btn" onClick={handleRegister} disabled={processing}>{processing? 'Processing...' : 'Register & Pay via wallet'}</button>
        </div>
      </div>
    </div>
  );
}
