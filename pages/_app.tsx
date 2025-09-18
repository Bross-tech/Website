// pages/_app.tsx
import type { AppProps } from "next/app";
import { CartProvider } from "@/context/CartContext";   // ✅ Corrected folder path
import Navbar from "@/components/Navbar";
import CartWidget from "@/components/CartWidget";       // ✅ Use CartWidget instead of Cart
import "@/styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CartProvider>
      <Navbar />
      <Component {...pageProps} />
      <CartWidget /> {/* ✅ Floating widget instead of full Cart */}
    </CartProvider>
  );
}
