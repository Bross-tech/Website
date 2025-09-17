// pages/_app.tsx
import type { AppProps } from "next/app";
import { CartProvider } from "@/context/CartContext";   // ✅ singular folder name
import Navbar from "@/components/Navbar";
import Cart from "@/components/Cart";                   // ✅ use Cart.tsx
import "@/styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CartProvider>
      <Navbar />
      <Component {...pageProps} />
      <Cart />
    </CartProvider>
  );
}
