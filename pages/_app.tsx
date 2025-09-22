// pages/_app.tsx
import type { AppProps } from "next/app";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import CartWidget from "@/components/CartWidget";
import "@/styles/globals.css";

// Inner component to consume AuthContext
function AppContent({ Component, pageProps }: AppProps) {
  const { userId, role, wallet } = useAuth(); // ✅ correct fields

  return (
    <CartProvider>
      {/* ✅ Pass userId (or role) to Navbar instead of user */}
      <Navbar userId={userId} role={role} wallet={wallet} />
      <Component {...pageProps} />
      <CartWidget />
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
