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

  // Update body class, localStorage, and CSS variables
  useEffect(() => {
    if (dark === null) return;

    const root = document.documentElement;

    if (dark) {
      document.body.classList.add("dark");
      root.style.setProperty("--bg", "#181818");
      root.style.setProperty("--fg", "#f1f1f1");
      root.style.setProperty("--btn-bg", "#262626");
      root.style.setProperty("--btn-fg", "#f1f1f1");
      root.style.setProperty("--btn-border", "#555");
    } else {
      document.body.classList.remove("dark");
      root.style.setProperty("--bg", "#ffffff");
      root.style.setProperty("--fg", "#181818");
      root.style.setProperty("--btn-bg", "#f1f1f1");
      root.style.setProperty("--btn-fg", "#181818");
      root.style.setProperty("--btn-border", "#ccc");
    }

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
      className="px-4 py-2 rounded transition border"
      style={{
        background: "var(--btn-bg)",
        color: "var(--btn-fg)",
        borderColor: "var(--btn-border)",
      }}
      onClick={() => setDark((d) => !d)}
      aria-pressed={dark}
    >
      {dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    </button>
  );
}
