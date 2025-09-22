// pages/_app.tsx
import type { AppProps } from "next/app";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import CartWidget from "@/components/CartWidget";
import "@/styles/globals.css";

function AppWrapper({ Component, pageProps }: AppProps) {
  const { user } = useAuth(); // Get the current user from AuthContext

  return (
    <CartProvider>
      <Navbar user={user} />
      <Component {...pageProps} />
      <CartWidget />
    </CartProvider>
  );
}

export default function MyApp(props: AppProps) {
  return (
    <AuthProvider>
      <AppWrapper {...props} />
    </AuthProvider>
  );
      }
