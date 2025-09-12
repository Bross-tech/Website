import { useState } from "react";
import SignupForm from "../components/SignupForm";
import LoginForm from "../components/LoginForm";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"signup" | "login">("signup");

  return (
    <div style={{ maxWidth: 600, margin: "50px auto", padding: 20, border: "1px solid #ddd", borderRadius: 8 }}>
      <div style={{ display: "flex", marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab("signup")}
          style={{
            flex: 1,
            padding: 10,
            background: activeTab === "signup" ? "#2196f3" : "#eee",
            color: activeTab === "signup" ? "#fff" : "#000",
            border: "none",
            cursor: "pointer",
          }}
        >
          Sign Up
        </button>
        <button
          onClick={() => setActiveTab("login")}
          style={{
            flex: 1,
            padding: 10,
            background: activeTab === "login" ? "#2196f3" : "#eee",
            color: activeTab === "login" ? "#fff" : "#000",
            border: "none",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </div>

      <div>
        {activeTab === "signup" && <SignupForm />}
        {activeTab === "login" && <LoginForm />}
      </div>
    </div>
  );
}
