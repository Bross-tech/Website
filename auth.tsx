import { useState } from "react";
import SignupForm from "../components/SignupForm";
import LoginForm from "../components/LoginForm";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"signup" | "login">("signup");

  const TabButton = ({ tab, label }: { tab: "signup" | "login"; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      style={{
        marginRight: 8,
        padding: "8px 16px",
        background: activeTab === tab ? "#2196f3" : "#eee",
        color: activeTab === tab ? "#fff" : "#000",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
      <div style={{ marginBottom: 16 }}>
        <TabButton tab="signup" label="Sign Up" />
        <TabButton tab="login" label="Login" />
      </div>

      <div>
        {activeTab === "signup" && <SignupForm />}
        {activeTab === "login" && <LoginForm />}
      </div>
    </div>
  );
}
