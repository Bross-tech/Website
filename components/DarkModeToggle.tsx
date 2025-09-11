import React, { useState, useEffect } from "react";

export function DarkModeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  // Initialize dark mode state safely (SSR-friendly)
  useEffect(() => {
    const saved = localStorage.getItem("dark_mode");
    if (saved !== null) {
      setDark(saved === "true");
    } else {
      setDark(
        window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }
  }, []);

  // Update body class and localStorage whenever dark changes
  useEffect(() => {
    if (dark === null) return; // Wait until state is initialized
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("dark_mode", String(dark));
  }, [dark]);

  // Sync dark mode across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "dark_mode") setDark(e.newValue === "true");
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  if (dark === null) return null; // Avoid flicker on SSR

  return (
    <button
      className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition"
      onClick={() => setDark((d) => !d)}
      aria-pressed={dark}
    >
      {dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    </button>
  );
}
