import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Agent = {
  id: string;
  business_name?: string;
  logo_url?: string;
};

type AgentProfileProps = {
  agent: Agent;
};

export const AgentProfile: React.FC<AgentProfileProps> = ({ agent }) => {
  const [businessName, setBusinessName] = useState(agent.business_name || "");
  const [logo, setLogo] = useState(agent.logo_url || "");
  const [loading, setLoading] = useState(false);

  const updateProfile = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("users")
      .update({ business_name: businessName, logo_url: logo })
      .eq("id", agent.id);
    setLoading(false);
    if (error) {
      alert("Failed to update profile: " + error.message);
    } else {
      alert("Profile updated!");
    }
  };

  return (
    <div style={{
      background: "#fff",
      padding: "32px 32px 24px 32px",
      borderRadius: 8,
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      maxWidth: 380,
      margin: "32px auto"
    }}>
      <h3 style={{
        textAlign: "center",
        marginBottom: 24,
        color: "#183153"
      }}>Edit Agent Profile</h3>
      <div style={{ marginBottom: 18 }}>
        <label htmlFor="businessName" style={{
          display: "block",
          marginBottom: 6,
          fontWeight: 600,
          color: "#444"
        }}>
          Business Name
        </label>
        <input
          id="businessName"
          value={businessName}
          onChange={e => setBusinessName(e.target.value)}
          placeholder="Business Name"
          style={{
            width: "100%",
            padding: "9px 12px",
            border: "1px solid #d4d4d4",
            borderRadius: 4,
            fontSize: "1rem",
            transition: "border 0.2s"
          }}
        />
      </div>
      <div style={{ marginBottom: 18 }}>
        <label htmlFor="logoUrl" style={{
          display: "block",
          marginBottom: 6,
          fontWeight: 600,
          color: "#444"
        }}>
          Logo URL
        </label>
        <input
          id="logoUrl"
          value={logo}
          onChange={e => setLogo(e.target.value)}
          placeholder="Logo URL"
          style={{
            width: "100%",
            padding: "9px 12px",
            border: "1px solid #d4d4d4",
            borderRadius: 4,
            fontSize: "1rem",
            transition: "border 0.2s"
          }}
        />
      </div>
      <button
        onClick={updateProfile}
        disabled={loading}
        style={{
          width: "100%",
          padding: "11px 0",
          background: loading ? "#b5b5b5" : "#183153",
          color: "#fff",
          border: "none",
          borderRadius: 5,
          fontSize: "1rem",
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background 0.2s",
          marginTop: 12
        }}
      >
        {loading ? "Updating..." : "Update Profile"}
      </button>
      {logo && (
        <div style={{ marginTop: 22, textAlign: "center" }}>
          <p>Logo Preview:</p>
          <img
            src={logo}
            alt="Logo Preview"
            style={{
              maxWidth: 120,
              maxHeight: 120,
              marginTop: 7,
              borderRadius: 8,
              border: "1px solid #eee",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
            }}
          />
        </div>
      )}
    </div>
  );
};
