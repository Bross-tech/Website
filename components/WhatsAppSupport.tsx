"use client";

import { useState } from "react";

export default function WhatsAppSupport() {
  const [showForm, setShowForm] = useState(false);
  const [network, setNetwork] = useState("");
  const [recipient, setRecipient] = useState("");
  const [size, setSize] = useState("");
  const [date, setDate] = useState("");

  const handleSend = () => {
    if (!network || !recipient || !size || !date) {
      alert("Please fill in all fields.");
      return;
    }

    const message = `Issue: order not received\nNetwork: ${network}\nRecipient: ${recipient}\nSize: ${size}\nDate: ${date}`;
    const link = `https://wa.me/233556429525?text=${encodeURIComponent(message)}`;
    window.open(link, "_blank");
  };

  return (
    <>
      {/* Floating Buttons */}
      <div className="fixed left-4 bottom-4 flex flex-col gap-3 z-50 md:hidden">
        <a
          href="https://wa.me/233247918766"
          target="_blank"
          rel="noreferrer"
          className="w-14 h-14 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg hover:bg-green-700 transition"
          aria-label="Help"
        >
          Help
        </a>

        <button
          onClick={() => setShowForm((s) => !s)}
          className="w-14 h-14 rounded-full bg-teal-400 text-white flex items-center justify-center shadow-lg hover:bg-teal-500 transition"
          aria-label="Order"
        >
          Order
        </button>

        <a
          href="https://chat.whatsapp.com/BoesNGVpxrq8H6KQ3J2x4w"
          target="_blank"
          rel="noreferrer"
          className="w-14 h-14 rounded-full bg-green-900 text-white flex items-center justify-center shadow-lg hover:bg-green-800 transition"
          aria-label="Group"
        >
          Group
        </a>
      </div>

      {/* Order Form */}
      {showForm && (
        <div className="fixed left-20 bottom-4 w-80 bg-white p-4 rounded-lg shadow-lg z-50">
          <h4 className="text-lg font-semibold mb-3">Report Order Issue</h4>

          <input
            type="text"
            placeholder="Network (e.g. MTN)"
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            className="input mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Recipient Number (+233...)"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="input mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Data Size (e.g. 2GB)"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="input mb-2 w-full"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input mb-3 w-full"
          />

          <div className="flex gap-2">
            <button
              onClick={handleSend}
              className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition"
            >
              Send
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-400 text-white px-3 py-2 rounded hover:bg-gray-500 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
