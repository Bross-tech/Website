import type { AppProps } from "next/app";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import CartWidget from "@/components/CartWidget";
import BottomNav from "@/components/BottomNav"; // ✅ import bottom nav
import { Toaster } from "react-hot-toast";
import "@/styles/globals.css";

// Inner component to consume AuthContext
function AppContent({ Component, pageProps }: AppProps) {
  const { userId, role, wallet } = useAuth();

  return (
    <CartProvider>
      {/* Top navbar */}
      <Navbar userId={userId} role={role} wallet={wallet} />

      {/* Main page content */}
      <div className="pb-20"> {/* ✅ padding-bottom to avoid overlap with BottomNav */}
        <Component {...pageProps} />
      </div>

      {/* Floating components */}
      <CartWidget />
      <BottomNav /> {/* ✅ always visible on mobile */}
      <Toaster position="top-right" reverseOrder={false} />
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
