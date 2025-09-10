import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Agent = {
  id: string;
};

type AgentAnnouncementsProps = {
  agent: Agent;
};

export const AgentAnnouncements: React.FC<AgentAnnouncementsProps> = ({ agent }) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendAnnouncement = async () => {
    if (!message.trim()) {
      alert("Please enter an announcement message.");
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("announcements")
      .insert({ agent_id: agent.id, message, date: new Date().toISOString() });
    setLoading(false);
    if (error) {
      alert("Failed to send announcement: " + error.message);
    } else {
      setMessage("");
      alert("Announcement sent!");
    }
  };

  return (
    <div style={{
      background: "#fff",
      padding: 24,
      borderRadius: 8,
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      maxWidth: 400,
      margin: "32px auto"
    }}>
      <h3 style={{ textAlign: "center", marginBottom: 18, color: "#183153" }}>
        Send Announcement
      </h3>
      <label htmlFor="announcement-message" style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
        Message
      </label>
      <textarea
        id="announcement-message"
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Announcement"
        rows={4}
        style={{
          width: "100%",
          padding: 10,
          border: "1px solid #d4d4d4",
          borderRadius: 4,
          resize: "vertical",
          fontSize: "1rem",
          marginBottom: 14
        }}
        disabled={loading}
      />
      <button
        onClick={sendAnnouncement}
        disabled={loading || !message.trim()}
        style={{
          width: "100%",
          padding: "11px 0",
          background: loading || !message.trim() ? "#b5b5b5" : "#183153",
          color: "#fff",
          border: "none",
          borderRadius: 5,
          fontSize: "1rem",
          fontWeight: 600,
          cursor: loading || !message.trim() ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </div>
  );
};
