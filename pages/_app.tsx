"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import BottomNav from "@/components/BottomNav";
import CartWidget from "@/components/CartWidget";
import WhatsAppSupport from "@/components/WhatsAppSupport";
import { Toaster } from "react-hot-toast";
import "@/styles/globals.css";

type Props = { children: ReactNode };

function AppLayout({ children }: Props) {
  const { userId, role, wallet } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    const adminRoutes = ["/admin-dashboard"];
    const userRoutes = ["/dashboard", "/bundles", "/afa-registration"];

    const path = router.pathname;

    if (role === "admin" && userRoutes.includes(path)) {
      router.push("/admin-dashboard");
    }

    if (role !== "admin" && adminRoutes.includes(path)) {
      router.push("/dashboard");
    }
  }, [userId, role, router]);

  return (
    <CartProvider>
      <div className="pb-20">{children}</div>

      <CartWidget />
      <BottomNav userId={userId} role={role} wallet={wallet} />
      <WhatsAppSupport role={role} />
      <Toaster position="top-right" reverseOrder={false} />
    </CartProvider>
  );
}

export default function MyApp({ Component, pageProps }: any) {
  return (
    <AuthProvider>
      <AppLayout>
        <Component {...pageProps} />
      </AppLayout>
    </AuthProvider>
  );
}
