import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { PRICES } from "../lib/pricing";
import { UpgradeToAgent } from "../components/UpgradeToAgent";
import { PaystackButton } from "react-paystack";
import { AgentReferral } from "../components/AgentReferral";
import { BulkBundlePurchase } from "../components/BulkBundlePurchase";
import { AgentEarnings } from "../components/AgentEarnings";
import { AgentAnnouncements } from "../components/AgentAnnouncements";
import { AgentProfile } from "../components/AgentProfile";
import { AgentInvoice } from "../components/AgentInvoice";
import { SupportTickets } from "../components/SupportTickets";
import { PurchaseAnalytics } from "../components/PurchaseAnalytics";
import { DarkModeToggle } from "../components/DarkModeToggle";
import { ExportCSV } from "../components/ExportCSV";
import { NotificationsCenter } from "../components/NotificationsCenter";
import { PromoCodeRedeem } from "../components/PromoCodeRedeem";
import { WhatsAppWidget } from "../components/WhatsAppWidget";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>("user");
  const [walletBalance, setWalletBalance] = useState(0);
  const [purchases, setPurchases] = useState([]);
  const [bundleLoading, setBundleLoading] = useState(false);
  const [afaLoading, setAfaLoading] = useState(false);

  // Auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signup, setSignup] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) setUser(data.user); });
  }, []);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("users").select("role").eq("id", user.id).single(),
      supabase.from("wallets").select("balance").eq("user_id", user.id).single(),
      supabase.from("purchases").select("*").eq("user_id", user.id).order("date", { ascending: false })
    ]).then(([roleRes, walletRes, purchasesRes]) => {
      setRole(roleRes.data?.role || "user");
      setWalletBalance(walletRes.data?.balance ?? 0);
      setPurchases(purchasesRes.data ?? []);
    });
  }, [user]);

  // React to role change instantly
  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
  };

  // Pricing logic
  const currentPrices = PRICES[role === "agent" ? "agent" : "customer"];

  // Bundle purchase logic
  const handleBundlePurchase = async (bundle: any) => {
    if (!user) return;
    if (walletBalance < bundle.price) { alert("Insufficient balance."); return; }
    setBundleLoading(true);
    await supabase.rpc("decrement_wallet_balance", { user_id_input: user.id, amount_input: bundle.price });
    await supabase.from("purchases").insert([{ network: "Bundle", bundle: bundle.name, price: bundle.price, date: new Date().toISOString(), user_id: user.id }]);
    setWalletBalance(prev => prev - bundle.price);
    setBundleLoading(false);
    alert("Bundle purchased!");
  };

  // AFA registration logic
  const handleAfaRegister = async () => {
    if (!user) return;
    if (walletBalance < currentPrices.afa) { alert("Insufficient balance."); return; }
    setAfaLoading(true);
    await supabase.rpc("decrement_wallet_balance", { user_id_input: user.id, amount_input: currentPrices.afa });
    await supabase.from("afa").insert([{ name: "AFA Registration", phone: "000", email: user.email, dob: "2000-01-01" }]);
    setWalletBalance(prev => prev - currentPrices.afa);
    setAfaLoading(false);
    alert("AFA Registered!");
  };

  // Email login/signup only
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null); setLoading(true);
    if (!email || !password) { setErrorMsg("Email and password required."); setLoading(false); return; }
    if (signup) {
      const { error, data } = await supabase.auth.signUp({ email, password });
      if (error) setErrorMsg(error.message);
      else setUser(data.user);
    } else {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setErrorMsg(error.message);
      else setUser(data.user);
    }
    setLoading(false);
  };

  // Deposit via wallet prompt
  const handleDeposit = async () => {
    if (!user) return;
    const amountStr = prompt("Enter amount to deposit:");
    const amount = Number(amountStr);
    if (!amountStr || isNaN(amount) || amount <= 0) { alert("Invalid amount."); return; }
    setLoading(true);
    await supabase.rpc("increment_wallet_balance", { user_id_input: user.id, amount_input: amount });
    setWalletBalance(prev => prev + amount);
    setLoading(false);
  };

  // Paystack deposit
  const [depositAmount, setDepositAmount] = useState("");
  const [paystackEmail, setPaystackEmail] = useState("");
  const paystackAmount = Number(depositAmount) * 100;
  const paystackConfig = {
    email: paystackEmail,
    amount: paystackAmount,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
    onSuccess: async (ref: any) => {
      setLoading(true);
      // Call backend to verify
      const res = await fetch("/api/verify-paystack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: ref.reference, userId: user.id, amount: Number(depositAmount) })
      });
      const data = await res.json();
      if (data.success) {
        setWalletBalance(prev => prev + Number(depositAmount));
        alert(`Deposited GHS ${depositAmount} successfully!`);
        setDepositAmount("");
      } else alert(data.message || "Deposit failed.");
      setLoading(false);
    },
    onClose: () => alert("Payment closed")
  };

  // Auth UI
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-8 bg-white rounded shadow w-80">
          <h1 className="text-xl font-bold mb-4">{signup ? "Sign Up" : "Login"}</h1>
          {errorMsg && <p className="text-red-500">{errorMsg}</p>}
          <form onSubmit={handleAuth} className="mt-4 space-y-2">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border p-2 rounded" required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border p-2 rounded" required />
            <button type="submit" className="w-full bg-green-600 text-white p-2 rounded" disabled={loading}>{loading ? "Processing..." : signup ? "Sign Up" : "Login"}</button>
          </form>
          <button onClick={() => setSignup(!signup)} className="mt-4 text-blue-600 underline">{signup ? "Have an account? Login" : "New user? Sign Up"}</button>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-center">Dashboard</h1>
      <DarkModeToggle />
      <NotificationsCenter user={user} />
      <div className="bg-gray-100 p-4 rounded shadow flex justify-between items-center">
        <span>Balance: GHS {walletBalance.toFixed(2)}</span>
        <button onClick={handleDeposit} className="bg-green-600 text-white px-3 py-1 rounded">Deposit</button>
      </div>
      {/* Only show upgrade if not an agent */}
      {role !== "agent" && (
        <UpgradeToAgent
          user={user}
          walletBalance={walletBalance}
          onRoleChange={handleRoleChange}
        />
      )}
      <div className="p-4 bg-gray-100 rounded shadow space-y-2">
        <h2 className="font-bold">Deposit via Paystack</h2>
        <input type="email" placeholder="Email" value={paystackEmail} onChange={e => setPaystackEmail(e.target.value)} className="w-full border p-2 rounded mb-2" required />
        <input type="number" placeholder="Amount" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} className="w-full border p-2 rounded mb-2" required />
        <PaystackButton {...paystackConfig} />
      </div>
      <div className="p-4 bg-gray-100 rounded shadow space-y-2">
        <h2 className="font-bold">Bundles ({role === "agent" ? "Agent Prices" : "Customer Prices"})</h2>
        {currentPrices.bundles.map((bundle: any, i: number) => (
          <button key={i} onClick={() => handleBundlePurchase(bundle)} className="w-full bg-blue-500 text-white p-2 rounded mb-2" disabled={bundleLoading}>
            {bundle.name} - GHS {bundle.price}
          </button>
        ))}
      </div>
      {/* Agent-only features */}
      {role === "agent" && (
        <>
          <AgentReferral agent={user} />
          <BulkBundlePurchase agent={user} walletBalance={walletBalance} bundlePrice={currentPrices.bundles[0].price} />
          <AgentEarnings agent={user} />
          <AgentAnnouncements agent={user} />
          <AgentProfile agent={user} />
          {/* Add more agent features/components here */}
        </>
      )}
      <div className="p-4 bg-gray-100 rounded shadow">
        <h2 className="font-bold mb-2">Purchase History</h2>
        <ExportCSV data={purchases} filename="purchases.csv" />
        <ul>
          {purchases.map((p: any) => (
            <li key={p.id}>{p.network} - {p.bundle} - GHS {p.price.toFixed(2)} - {new Date(p.date).toLocaleString()}</li>
          ))}
        </ul>
      </div>
      <PurchaseAnalytics user={user} />
      <SupportTickets user={user} />
      <PromoCodeRedeem user={user} />
      <button onClick={handleAfaRegister} className="w-full bg-purple-600 text-white p-2 rounded mb-2" disabled={afaLoading}>
        Register AFA ({role === "agent" ? "Agent" : "Customer"} price: GHS {currentPrices.afa})
      </button>
      {/* WhatsApp Widget ALWAYS at the bottom */}
      <WhatsAppWidget />
    </div>
  );
}
