// pages/_app.tsx
import type { AppProps } from "next/app";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import CartWidget from "@/components/CartWidget";
import { Toaster } from "react-hot-toast";  // ✅ toast provider
import "@/styles/globals.css";

// Inner component to consume AuthContext
function AppContent({ Component, pageProps }: AppProps) {
  const { userId, role, wallet } = useAuth();

  return (
    <CartProvider>
      <Navbar userId={userId} role={role} wallet={wallet} />
      <Component {...pageProps} />
      <CartWidget />
      <Toaster position="top-right" reverseOrder={false} /> {/* ✅ toast available */}
    </CartProvider>
  );
}

export default function MyApp(props: AppProps) {
  return (
    <AuthProvider>
      <AppContent {...props} />
    </AuthProvider>
  );
}
