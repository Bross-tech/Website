import type { AppProps } from "next/app";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import CartWidget from "@/components/CartWidget";
import BottomNav from "@/components/BottomNav";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import { useEffect } from "react";
import "@/styles/globals.css";

function AppContent({ Component, pageProps }: AppProps) {
  const { userId, role, wallet } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    const adminRoutes = ["/admin-dashboard"];
    const userRoutes = ["/dashboard", "/bundles", "/afa-registration"];

    const path = router.pathname;

    // Admin trying to access user pages → redirect to admin dashboard
    if (role === "admin" && userRoutes.includes(path)) {
      router.push("/admin-dashboard");
    }

    // Non-admin trying to access admin pages → redirect to regular dashboard
    if (role !== "admin" && adminRoutes.includes(path)) {
      router.push("/dashboard");
    }
  }, [userId, role, router]);

  return (
    <CartProvider>
      {/* Top navbar */}
      <Navbar userId={userId} role={role} wallet={wallet} />

      {/* Main content with bottom nav spacing */}
      <div className="pb-20">
        <Component {...pageProps} />
      </div>

      {/* Floating components */}
      <CartWidget />
      <BottomNav />
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
