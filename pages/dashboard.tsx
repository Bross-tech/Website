import Head from "next/head";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import WhatsAppSupport from "../components/WhatsAppSupport";
import Cart from "../components/Cart";

export default function Dashboard(){
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ total:0, pending:0, processing:0, complete:0 });

  useEffect(()=>{
    (async ()=>{
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if(user){
        const { data: profileRow } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(profileRow);
      }

      const { data: orders } = await supabase.from('orders').select('status');
      if(Array.isArray(orders)){
        setStats({
          total: orders.length,
          pending: orders.filter((o:any)=>o.status==='pending').length,
          processing: orders.filter((o:any)=>o.status==='processing').length,
          complete: orders.filter((o:any)=>o.status==='completed').length,
        });
      }
    })();
  },[]);

  return (
    <>
      <Head><title>Dashboard — DataStore4gh</title></Head>
      <div className="container">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h1>Dashboard</h1>
          <div style={{ display:'flex', gap:12 }}>
            <div className="card" style={{ padding:10 }}>
              <div className="small">Wallet</div>
              <div style={{ fontWeight:700, fontSize:18 }}>GHS {Number(profile?.wallet ?? 0).toFixed(2)}</div>
              <a href="/api/paystack" className="btn" style={{ marginTop:8 }}>Top up</a>
            </div>

            <div className="card" style={{ padding:10 }}>
              <div className="small">Account</div>
              <div style={{ fontWeight:700 }}>{profile?.username ?? profile?.email ?? '—'}</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop:18 }} className="stats">
          <div className="stat">
            <div className="small">Total</div>
            <div style={{ fontWeight:700 }}>{stats.total}</div>
          </div>
          <div className="stat">
            <div className="small">Pending</div>
            <div style={{ fontWeight:700 }}>{stats.pending}</div>
          </div>
          <div className="stat">
            <div className="small">Processing</div>
            <div style={{ fontWeight:700 }}>{stats.processing}</div>
          </div>
          <div className="stat">
            <div className="small">Complete</div>
            <div style={{ fontWeight:700 }}>{stats.complete}</div>
          </div>
        </div>

        <div style={{ marginTop:20 }}>
          <h3>Quick actions</h3>
          <div style={{ display:'flex', gap:8 }}>
            <a className="btn" href="/bundles">Buy Bundles</a>
            <a className="btn" href="/afa">AFA registration</a>
          </div>
        </div>

      </div>

      <Cart />
      <WhatsAppSupport />
    </>
  );
}
