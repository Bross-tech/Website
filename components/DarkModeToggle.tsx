import React, { useState, useEffect } from "react";

export function DarkModeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dark_mode");
      if (saved !== null) return saved === "true";
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("dark_mode", dark ? "true" : "false");
  }, [dark]);

  return (
    <button className="dark-toggle-btn" onClick={() => setDark(d => !d)}>
      Toggle {dark ? "Light" : "Dark"} Mode
    </button>
  );
}
