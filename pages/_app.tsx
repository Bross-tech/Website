import type { AppProps } from "next/app";
import { CartProvider } from "@/contexts/CartContext";
import Navbar from "@/components/Navbar";
import CartWidget from "@/components/CartWidget";
import "@/styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CartProvider>
      <Navbar />
      <Component {...pageProps} />
      <CartWidget />
    </CartProvider>
  );
}
