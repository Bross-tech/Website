import React, { useState } from "react";

const DarkModeToggle = () => {
  const [dark, setDark] = useState(false);
  return (
    <button onClick={() => setDark(!dark)}>
      {dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    </button>
  );
};
export { DarkModeToggle };
