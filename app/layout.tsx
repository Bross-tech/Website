// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import {
  MdDashboard,
  MdManageAccounts,
} from "react-icons/md";
import { FaHistory, FaExchangeAlt, FaRegIdCard } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Website",
  description: "My Next.js App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 flex flex-col min-h-screen">
        {/* Main content */}
        <div className="flex-1 pb-16">{children}</div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-md flex justify-around items-center h-16 border-t">
          {/* Orders / History */}
          <Link href="/orders" className="flex flex-col items-center text-sm">
            <FaHistory size={22} />
            <span>Orders</span>
          </Link>

          {/* Transactions */}
          <Link href="/transactions" className="flex flex-col items-center text-sm">
            <FaExchangeAlt size={22} />
            <span>Transactions</span>
          </Link>

          {/* Dashboard */}
          <Link href="/dashboard" className="flex flex-col items-center text-sm">
            <MdDashboard size={22} />
            <span>Dashboard</span>
          </Link>

          {/* AFA Registration */}
          <Link href="/afa" className="flex flex-col items-center text-sm">
            <FaRegIdCard size={22} />
            <span>AFA</span>
          </Link>

          {/* Account */}
          <Link href="/auth/account" className="flex flex-col items-center text-sm">
            <MdManageAccounts size={22} />
            <span>Account</span>
          </Link>
        </nav>
      </body>
    </html>
  );
}
