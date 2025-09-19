// pages/bundles.tsx
"use client";

import Head from "next/head";
import Bundles from "@/components/Bundles";
import Navbar from "@/components/Navbar";
import WhatsAppSupport from "@/components/WhatsAppSupport";
import CartWidget from "@/components/CartWidget";

export default function BundlesPage() {
  return (
    <>
      <Head>
        <title>Available Bundles</title>
      </Head>
      <Navbar />
      <main className="p-6">
        <Bundles />
        <CartWidget />       {/* ✅ works without props */}
        <WhatsAppSupport />
      </main>
    </>
  );
}
