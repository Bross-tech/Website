#!/bin/bash
set -e

echo "📂 Ensuring public/ exists..."
mkdir -p public

echo "🖼️ Making sure background image exists..."
if [ ! -f public/bg.jpg ]; then
  wget -O public/bg.jpg "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1350&q=80" || \
  curl -L "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1350&q=80" -o public/bg.jpg
fi

echo "🎨 Updating global background..."
mkdir -p styles
cat > styles/globals.css <<'CSS'
body {
  background: url('/bg.jpg') no-repeat center center fixed;
  background-size: cover;
  margin: 0;
  padding: 0;
  min-height: 100vh;
  font-family: Arial, sans-serif;
}
CSS

echo "📑 Replacing dashboard.tsx..."
mkdir -p pages
cat > pages/dashboard.tsx <<'TSX'
import Link from "next/link";
import { FaCog, FaShoppingCart, FaBox, FaComments, FaClipboardList, FaWindows } from "react-icons/fa";

export default function Dashboard() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-white">
      {/* Settings - top left */}
      <Link href="/settings" className="absolute top-4 left-4 text-3xl">
        <FaCog />
      </Link>

      {/* Floating shop - right middle */}
      <Link href="/shop" className="absolute top-1/2 right-4 transform -translate-y-1/2 text-3xl">
        <FaShoppingCart />
      </Link>

      {/* Bottom dock */}
      <div className="absolute bottom-4 flex justify-center items-center space-x-12 w-full">
        {/* Left side */}
        <div className="flex space-x-6">
          <Link href="/orders" className="text-3xl">
            <FaBox />
          </Link>
          <Link href="/complaints" className="text-3xl">
            <FaComments />
          </Link>
        </div>

        {/* Dashboard center */}
        <Link href="/dashboard" className="text-5xl">
          <FaWindows />
        </Link>

        {/* Right side */}
        <div className="flex space-x-6">
          <Link href="/afa" className="text-3xl">
            <FaClipboardList />
          </Link>
        </div>
      </div>
    </div>
  );
}
TSX

echo "📑 Replacing complaints.tsx with WhatsApp widget..."
cat > pages/complaints.tsx <<'TSX'
import { useState } from "react";

export default function Complaints() {
  const [showForm, setShowForm] = useState(false);
  const [network, setNetwork] = useState("");
  const [recipient, setRecipient] = useState("");
  const [size, setSize] = useState("");
  const [date, setDate] = useState("");

  const buildMessage = () => {
    return encodeURIComponent(
      \`Issue: order not received\\nNetwork: \${network}\\nRecipient: \${recipient}\\nSize: \${size}\\nDate: \${date}\`
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Complaints</h1>

      <div className="flex flex-col items-start gap-4">
        <a
          href="https://wa.me/233247918766"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 bg-green-600 text-white rounded-lg shadow"
        >
          Chat with Support
        </a>

        <div
          onClick={() => setShowForm((s) => !s)}
          className="px-4 py-2 bg-emerald-400 text-black rounded-lg shadow cursor-pointer"
        >
          Report Order Issue
        </div>

        <a
          href="https://chat.whatsapp.com/BoesNGVpxrq8H6KQ3J2x4w"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 bg-green-900 text-white rounded-lg shadow"
        >
          Join WhatsApp Group
        </a>
      </div>

      {showForm && (
        <div className="mt-6 bg-white text-black p-4 rounded-xl shadow-lg max-w-md">
          <h4 className="font-semibold mb-2">Order not received — Report</h4>
          <div className="mb-2">
            <label className="block text-sm">Network</label>
            <input
              className="w-full border px-2 py-1 rounded"
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              placeholder="e.g. MTN"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm">Recipient Number</label>
            <input
              className="w-full border px-2 py-1 rounded"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="+233..."
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm">Data Size</label>
            <input
              className="w-full border px-2 py-1 rounded"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="e.g. 2GB"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm">Date of Order</label>
            <input
              type="date"
              className="w-full border px-2 py-1 rounded"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="flex gap-2 mt-2">
            <a
              href={\`https://wa.me/233556429525?text=\${buildMessage()}\`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 bg-green-600 text-white rounded"
            >
              Send to Support
            </a>
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1 bg-gray-400 text-black rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
TSX

echo "📝 Creating placeholder pages..."
for page in settings shop orders afa; do
  cat > pages/$page.tsx <<EOF2
export default function ${page^}() {
  return <h1 className="text-center mt-20 text-2xl">${page^} Page</h1>;
}
EOF2
done

echo "✅ Dashboard + Complaints setup complete! Now run: npm run dev"
