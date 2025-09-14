// pages/app.tsx
import React, { useState, useEffect } from "react";
import { PaymentButton } from "../components/PaymentButton";
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
import { WhatsAppWidget } from "../components/WhatsAppWidget";

export default function AppPage() {
  const [bundleLoading, setBundleLoading] = useState(false);
  const [bundles, setBundles] = useState<{ id: string; name: string; price: number }[]>([]);

  useEffect(() => {
    // Example: load bundles
    setBundles([
      { id: "1", name: "Data 1GB", price: 10 },
      { id: "2", name: "Data 5GB", price: 45 },
    ]);
  }, []);

  const handleBundlePurchase = (id: string) => {
    setBundleLoading(true);
    setTimeout(() => {
      console.log("Purchased bundle", id);
      setBundleLoading(false);
    }, 1000);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome to the App</h1>

      {/* Example bundle buttons */}
      <div className="space-y-2">
        {bundles.map((bundle) => (
          <button
            key={bundle.id}
            className="w-full bg-blue-500 text-white p-2 rounded mb-2"
            disabled={bundleLoading}
            onClick={() => handleBundlePurchase(bundle.id)}
          >
            {bundle.name} - GHS {bundle.price}
          </button>
        ))}
      </div>

      {/* Other features */}
      <div className="mt-6 space-y-4">
        <PaymentButton amount={50} onPay={() => console.log("Pay clicked")} />
        <UpgradeToAgent />
        <PaystackButton />
        <AgentReferral />
        <BulkBundlePurchase />
        <AgentEarnings />
        <AgentAnnouncements />
        <AgentProfile />
        <SupportTickets />
        <PurchaseAnalytics />
        <DarkModeToggle />
        <ExportCSV />
        <PromoCodeRedeem />
        <WhatsAppWidget />
      </div>
    </div>
  );
}
