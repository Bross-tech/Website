"use client";

import Navbar from "@/components/Navbar";
import Bundles from "@/components/Bundles";
import CartWidget from "@/components/CartWidget";
import { CartProvider } from "@/contexts/CartContext";

export default function HomePage() {
  return (
    <CartProvider>
      <Navbar />
      <main style={{ padding: 16 }}>
        <Bundles />
      </main>
      <CartWidget />
    </CartProvider>
  );
}
