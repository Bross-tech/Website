// pages/bundles.tsx
"use client";

import Head from "next/head";
import Bundles from "@/components/Bundles";          // component
import Navbar from "@/components/Navbar";
import WhatsAppSupport from "@/components/WhatsAppSupport";
import CartWidget from "@/components/CartWidget";    // replaces old Cart.tsx

export default function BundlesPage() {
  return (
    <>
      <Head>
        <title>Available Bundles</title>
      </Head>
      <Navbar />
      <main className="p-6">
        <Bundles />          {/* shows the bundle list */}
        <CartWidget />       {/* floating mini cart */}
        <WhatsAppSupport />  {/* WhatsApp support button */}
      </main>
    </>
  );
}
