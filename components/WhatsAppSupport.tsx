import { useState } from "react";

export default function WhatsAppSupport() {
  const [showForm, setShowForm] = useState(false);
  const [network, setNetwork] = useState("");
  const [recipient, setRecipient] = useState("");
  const [size, setSize] = useState("");
  const [date, setDate] = useState("");

  return (
    <>
      <div style={{ position: "fixed", left: 16, bottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        <a href="https://wa.me/233247918766" target="_blank" rel="noreferrer">
          <div style={{ width:56, height:56, borderRadius:28, background:"#25D366", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", boxShadow:"0 6px 18px rgba(0,0,0,0.15)"}}>
            Help
          </div>
        </a>

        <div onClick={() => setShowForm(s => !s)} style={{ cursor:"pointer" }}>
          <div style={{ width:56, height:56, borderRadius:28, background:"#2BFF8E", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 6px 18px rgba(0,0,0,0.12)"}}>
            Order
          </div>
        </div>

        <a href="https://chat.whatsapp.com/BoesNGVpxrq8H6KQ3J2x4w" target="_blank" rel="noreferrer">
          <div style={{ width:56, height:56, borderRadius:28, background:"#075E54", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
            Group
          </div>
        </a>
      </div>

      {showForm && (
        <div style={{ position:"fixed", left:86, bottom:16, width:320, background:"#fff", padding:16, borderRadius:8, boxShadow:"0 6px 18px rgba(0,0,0,0.12)" }}>
          <h4 style={{ marginTop:0 }}>Order not received — Report</h4>
          <div style={{ marginBottom:8 }}>
            <label className="small">Network</label>
            <input className="input" value={network} onChange={(e)=>setNetwork(e.target.value)} placeholder="e.g. MTN" />
          </div>
          <div style={{ marginBottom:8 }}>
            <label className="small">Recipient Number</label>
            <input className="input" value={recipient} onChange={(e)=>setRecipient(e.target.value)} placeholder="+233..." />
          </div>
          <div style={{ marginBottom:8 }}>
            <label className="small">Data Size</label>
            <input className="input" value={size} onChange={(e)=>setSize(e.target.value)} placeholder="e.g. 2GB" />
          </div>
          <div style={{ marginBottom:8 }}>
            <label className="small">Date of Order</label>
            <input className="input" type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <a href={`https://wa.me/233556429525?text=${encodeURIComponent(`Issue: order not received\nNetwork:${network}\nRecipient:${recipient}\nSize:${size}\nDate:${date}`)}`} target="_blank" rel="noreferrer" className="btn">Send to Support</a>
            <button onClick={()=>setShowForm(false)} className="btn" style={{ background:"#999" }}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
