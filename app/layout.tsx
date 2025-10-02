// app/layout.tsx
"use client";

import "./globals.css";
import type { Metadata } from "next";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import BottomNav from "@/components/BottomNav";
import CartWidget from "@/components/CartWidget";
import WhatsAppSupport from "@/components/WhatsAppSupport";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "DATASTORE4GH",
  description: "Fast, Secure & Affordable Data Services in Ghana",
};

type RootLayoutProps = {
  children: ReactNode;
};

function InnerLayout({ children }: RootLayoutProps) {
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
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
        {/* Header */}
        <header className="bg-gray-900 text-center py-4 sticky top-0 z-50">
          <h1 className="text-2xl font-bold text-green-500">DATASTORE4GH</h1>
          <p className="text-sm text-blue-400">
            Fast, Secure & Affordable Data Services in Ghana
          </p>
        </header>

        {/* Main content */}
        <main className="flex-1 pb-24">{children}</main>

        {/* Widgets */}
        <CartWidget />
        <BottomNav userId={userId} role={role} wallet={wallet} />
        <WhatsAppSupport role={role} />
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    </CartProvider>
  );
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <AuthProvider>
      <InnerLayout>{children}</InnerLayout>
    </AuthProvider>
  );
}
