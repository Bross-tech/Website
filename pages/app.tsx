import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { UpgradeToAgent } from "../components/UpgradeToAgent";
import { AgentReferral } from "../components/AgentReferral";
import { BulkBundlePurchase } from "../components/BulkBundlePurchase";
import { AgentEarnings } from "../components/AgentEarnings";
import { AgentAnnouncements } from "../components/AgentAnnouncements";
import { AgentProfile } from "../components/AgentProfile";
import { SupportTickets } from "../components/SupportTickets";
import { PurchaseAnalytics } from "../components/PurchaseAnalytics";
import { ExportCSV } from "../components/ExportCSV";
import { PromoCodeRedeem } from "../components/PromoCodeRedeem";
import { WhatsAppWidget } from "../components/WhatsAppWidget";

export default function App() {
  const [role, setRole] = useState<"customer" | "agent">("customer");
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [bundleLoading, setBundleLoading] = useState<string | null>(null);
  const [afaLoading, setAfaLoading] = useState(false);

  const currentPrices = {
    bundles: [
      { name: "Basic", price: 10 },
      { name: "Standard", price: 20 },
      { name: "Premium", price: 30 },
    ],
    afa: 50,
  };

  const handleRoleChange = (newRole: "customer" | "agent") => {
    setRole(newRole);
  };

  const handleBundlePurchase = async (bundle: { name: string; price: number }) => {
    try {
      setBundleLoading(bundle.name);

      const response = await fetch("/api/verifyPayment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: "12345", bundle }),
      });

      const data = await response.json();
      alert(`Payment status: ${data.status || "Unknown"}`);
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed. Please try again.");
    } finally {
      setBundleLoading(null);
    }
  };

  const handleAfaRegister = async () => {
    try {
      setAfaLoading(true);
      // Example: simulate registration
      await new Promise((res) => setTimeout(res, 2000));
      alert(`Registered AFA successfully for GHS ${currentPrices.afa}`);
    } catch (err) {
      console.error("AFA registration failed:", err);
    } finally {
      setAfaLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Upgrade to Agent */}
      {role !== "agent" && (
        <UpgradeToAgent
          user={{ name: "Demo User" }}
          walletBalance={walletBalance}
          onRoleChange={handleRoleChange}
        />
      )}

      {/* Bundles */}
      <div className="p-4 bg-gray-100 rounded shadow space-y-2">
        <h2 className="font-bold">
          Bundles ({role === "agent" ? "Agent Prices" : "Customer Prices"})
        </h2>
        {currentPrices.bundles.map((bundle) => (
          <button
            key={bundle.name}
            onClick={() => handleBundlePurchase(bundle)}
            className="w-full bg-blue-500 text-white p-2 rounded mb-2"
            disabled={!!bundleLoading}
          >
            {bundleLoading === bundle.name
              ? "Processing..."
              : `${bundle.name} - GHS ${bundle.price}`}
          </button>
        ))}
      </div>

      {/* Agent-only components */}
      {role === "agent" && (
        <>
          <AgentReferral agent={{ name: "Demo Agent" }} />
          <BulkBundlePurchase
            agent={{ name: "Demo Agent" }}
            walletBalance={walletBalance}
            bundlePrice={currentPrices.bundles[0].price}
          />
          <AgentEarnings agent={{ name: "Demo Agent" }} />
          <AgentAnnouncements agent={{ name: "Demo Agent" }} />
          <AgentProfile agent={{ name: "Demo Agent" }} />
        </>
      )}

      {/* Purchase History */}
      <div className="p-4 bg-gray-100 rounded shadow">
        <h2 className="font-bold mb-2">Purchase History</h2>
        <ExportCSV data={purchases} filename="purchases.csv" />
        <ul>
          {purchases.map((p, idx) => (
            <li key={idx}>
              {p.network} - {p.bundle} - GHS {p.price?.toFixed(2)} -{" "}
              {new Date(p.date).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>

      {/* Extra Components */}
      <PurchaseAnalytics user={{ name: "Demo User" }} />
      <SupportTickets user={{ name: "Demo User" }} />
      <PromoCodeRedeem user={{ name: "Demo User" }} />
      <WhatsAppWidget />

      {/* AFA Registration */}
      <button
        onClick={handleAfaRegister}
        className="w-full bg-purple-600 text-white p-2 rounded mb-2"
        disabled={afaLoading}
      >
        {afaLoading
          ? "Registering AFA..."
          : `Register AFA (Price: GHS ${currentPrices.afa})`}
      </button>
    </div>
  );
        }>

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
