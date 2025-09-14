import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { PRICES } from "../lib/pricing";
import { UpgradeToAgent } from "../components/UpgradeToAgent";
import { PaystackButton } from "../components/PaystackButton";
import { AgentReferral } from "../components/AgentReferral";
import { BulkBundlePurchase } from "../components/BulkBundlePurchase";
import { AgentEarnings } from "../components/AgentEarnings";
import { AgentAnnouncements } from "../components/AgentAnnouncements";
import { AgentProfile } from "../components/AgentProfile";
import { SupportTickets } from "../components/SupportTickets";
import { PurchaseAnalytics } from "../components/PurchaseAnalytics";
import { DarkModeToggle } from "../components/DarkModeToggle";
import { ExportCSV } from "../components/ExportCSV";
import { PromoCodeRedeem } from "../components/PromoCodeRedeem";
import { WhatsAppWidget } from "../components/WhatsAppChatWidget";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<"customer" | "agent">("customer");
  const [walletBalance, setWalletBalance] = useState(0);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [bundleLoading, setBundleLoading] = useState(false);
  const [afaLoading, setAfaLoading] = useState(false);

  // Deposit modal
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [paystackEmail, setPaystackEmail] = useState("");
  const amountInputRef = useRef<HTMLInputElement>(null);

  // Auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signup, setSignup] = useState(false);

  // Fetch user on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user);
    });
  }, []);

  // Fetch user data
  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      const [roleRes, walletRes, purchasesRes] = await Promise.all([
        supabase.from("users").select("role").eq("id", user.id).single(),
        supabase.from("wallets").select("balance").eq("user_id", user.id).single(),
        supabase.from("purchases").select("*").eq("user_id", user.id).order("date", { ascending: false }),
      ]);
      setRole((roleRes.data?.role as "customer" | "agent") || "customer");
      setWalletBalance(walletRes.data?.balance ?? 0);
      setPurchases(purchasesRes.data ?? []);
    };
    fetchUserData();
  }, [user]);

  // Focus deposit input
  useEffect(() => {
    if (showDepositModal && amountInputRef.current) {
      amountInputRef.current.focus();
    }
  }, [showDepositModal]);

  const handleRoleChange = (newRole: "customer" | "agent") => setRole(newRole);

  const currentPrices = PRICES[role];

  // Bundle purchase
  const handleBundlePurchase = async (bundle: any) => {
    if (!user) return;
    if (walletBalance < bundle.price) return alert("Insufficient balance.");

    setBundleLoading(true);
    await supabase.rpc("decrement_wallet_balance", {
      user_id_input: user.id,
      amount_input: bundle.price,
    });
    await supabase.from("purchases").insert([{
      network: "Bundle",
      bundle: bundle.name,
      price: bundle.price,
      date: new Date().toISOString(),
      user_id: user.id,
    }]);
    setWalletBalance(prev => prev - bundle.price);
    setBundleLoading(false);
    alert("Bundle purchased!");
  };

  // AFA registration
  const handleAfaRegister = async () => {
    if (!user) return;
    if (walletBalance < currentPrices.afa) return alert("Insufficient balance.");

    setAfaLoading(true);
    await supabase.rpc("decrement_wallet_balance", {
      user_id_input: user.id,
      amount_input: currentPrices.afa,
    });
    await supabase.from("afa").insert([{
      name: "AFA Registration",
      phone: "000",
      email: user.email,
      dob: "2000-01-01",
    }]);
    setWalletBalance(prev => prev - currentPrices.afa);
    setAfaLoading(false);
    alert("AFA Registered!");
  };

  // Auth handler
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (!email || !password) {
      setErrorMsg("Email and password required.");
      setLoading(false);
      return;
    }

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
            <button type="submit" className="w-full bg-green-600 text-white p-2 rounded" disabled={loading}>
              {loading ? "Processing..." : signup ? "Sign Up" : "Login"}
            </button>
          </form>
          <button onClick={() => setSignup(!signup)} className="mt-4 text-blue-600 underline">
            {signup ? "Have an account? Login" : "New user? Sign Up"}
          </button>
        </div>
      </div>
    );
  }

  // Dashboard UI
  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-center">Dashboard</h1>
      <DarkModeToggle />

      {/* Wallet Balance */}
      <div className="bg-gray-100 p-4 rounded shadow flex justify-between items-center">
        <span>Balance: GHS {walletBalance.toFixed(2)}</span>
        <button onClick={() => setShowDepositModal(true)} className="bg-green-600 text-white w-8 h-8 flex items-center justify-center rounded-full" title="Add Funds">+</button>
      </div>

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDepositModal && (
          <motion.div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white p-6 rounded-2xl shadow-xl w-80 space-y-4 relative" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
              <button onClick={() => setShowDepositModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl">&times;</button>
              <h3 className="text-lg font-bold">Deposit Funds</h3>
              <input type="number" ref={amountInputRef} placeholder="Enter amount (GHS)" className="w-full border p-2 rounded" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} required />
              <input type="email" placeholder="Enter your email" className="w-full border p-2 rounded" value={paystackEmail} onChange={(e) => setPaystackEmail(e.target.value)} required />
              <div className="flex justify-between space-x-2">
                <button onClick={() => setShowDepositModal(false)} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition">Cancel</button>
                <PaystackButton
                  userId={user.id}
                  amount={Number(depositAmount)}
                  email={paystackEmail}
                  onSuccess={async (newBalance: number) => {
                    // ✅ Use updated balance from backend
                    setWalletBalance(newBalance);
                    setDepositAmount("");
                    setPaystackEmail("");
                    setShowDepositModal(false);

                    try {
                      const [roleRes, walletRes, purchasesRes] = await Promise.all([
                        supabase.from("users").select("role").eq("id", user.id).single(),
                        supabase.from("wallets").select("balance").eq("user_id", user.id).single(),
                        supabase.from("purchases").select("*").eq("user_id", user.id).order("date", { ascending: false }),
                      ]);
                      setRole((roleRes.data?.role as "customer" | "agent") || "customer");
                      setWalletBalance(walletRes.data?.balance ?? newBalance);
                      setPurchases(purchasesRes.data ?? []);
                    } catch (err) {
                      console.error("Failed to refresh user data:", err);
                    }

                    alert(`Deposited successfully! New balance: GHS ${newBalance}`);
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade to Agent */}
      {role !== "agent" && <UpgradeToAgent user={user} walletBalance={walletBalance} onRoleChange={handleRoleChange} />}

      {/* Bundles */}
      <div className="p-4 bg-gray-100 rounded shadow space-y-2">
        <h2 className="font-bold">Bundles ({role === "agent" ? "Agent Prices" : "Customer Prices"})</h2>
        {currentPrices.bundles.map((bundle) => (
          <button key={bundle.name} onClick={() => handleBundlePurchase(bundle)} className="w-full bg-blue-500 text-white p-2 rounded mb-2" disabled={bundleLoading}>
            {bundle.name} - GHS {bundle.price}
          </button>
        ))}
      </div>

      {/* Agent-only components */}
      {role === "agent" && (
        <>
          <AgentReferral agent={user} />
          <BulkBundlePurchase agent={user} walletBalance={walletBalance} bundlePrice={currentPrices.bundles[0].price} />
          <AgentEarnings agent={user} />
          <AgentAnnouncements agent={user} />
          <AgentProfile agent={user} />
        </>
      )}

      {/* Purchase History */}
      <div className="p-4 bg-gray-100 rounded shadow">
        <h2 className="font-bold mb-2">Purchase History</h2>
        <ExportCSV data={purchases} filename="purchases.csv" />
        <ul>
          {purchases.map((p: any) => (
            <li key={p.id}>
              {p.network} - {p.bundle} - GHS {p.price.toFixed(2)} - {new Date(p.date).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>

      <PurchaseAnalytics user={user} />
      <SupportTickets user={user} />
      <PromoCodeRedeem user={user} />
      <WhatsAppWidget />

      {/* AFA Registration */}
      <button
        onClick={handleAfaRegister}
        className="w-full bg-purple-600 text-white p-2 rounded mb-2"
        disabled={afaLoading}
      >
        Register AFA (Price: GHS {currentPrices.afa})
      </button>
    </div>
  );
}
