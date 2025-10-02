// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DATASTORE4GH",
  description: "Fast, Secure & Affordable Data Services in Ghana",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 flex flex-col min-h-screen">
        {/* Header with name and tagline */}
        <header className="bg-gray-900 text-center py-4 sticky top-0 z-50">
          <h1 className="text-2xl font-bold text-green-500">DATASTORE4GH</h1>
          <p className="text-sm text-blue-400">
            Fast, Secure & Affordable Data Services in Ghana
          </p>
        </header>

        {/* Main content with padding to avoid overlap */}
        <main className="flex-1 pb-24">{children}</main>
      </body>
    </html>
  );
}
