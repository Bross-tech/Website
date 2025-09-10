import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Types
type User = { id: string; isAdmin?: boolean };
type Ticket = {
  id: string;
  user_id: string;
  message: string;
  status: string;
  created_at: string;
};
type Reply = {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  created_at: string;
};

export function SupportTickets({ user }: { user: User }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [message, setMessage] = useState("");
  const [replyMessage, setReplyMessage] = useState<{ [ticketId: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  // Admin view toggle
  const [adminView, setAdminView] = useState(false);

  // Fetch tickets (admin sees all, user sees own)
  const fetchTickets = async () => {
    setLoading(true);
    let query = supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
    if (!adminView || !user.isAdmin) {
      query = query.eq("user_id", user.id);
    }
    const { data, error } = await query;
    setTickets(data || []);
    setLoading(false);
  };

  // Fetch replies for all tickets loaded
  const fetchReplies = async (ticketIds?: string[]) => {
    if (!ticketIds || ticketIds.length === 0) {
      setReplies([]);
      return;
    }
    const { data, error } = await supabase
      .from("support_ticket_replies")
      .select("*")
      .in("ticket_id", ticketIds)
      .order("created_at", { ascending: true });
    setReplies(data || []);
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line
  }, [user.id, adminView]);

  useEffect(() => {
    if (tickets.length > 0) {
      fetchReplies(tickets.map(t => t.id));
    } else {
      setReplies([]);
    }
    // eslint-disable-next-line
  }, [tickets]);

  // Create new ticket
  const createTicket = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    await supabase.from("support_tickets").insert({
      user_id: user.id,
      message,
      status: "open",
      created_at: new Date().toISOString(),
    });
    setMessage("");
    setSubmitting(false);
    fetchTickets();
  };

  // Add a reply to a ticket
  const addReply = async (ticket: Ticket) => {
    const msg = replyMessage[ticket.id];
    if (!msg?.trim()) return;
    setSubmitting(true);
    await supabase.from("support_ticket_replies").insert({
      ticket_id: ticket.id,
      user_id: user.id,
      message: msg,
      created_at: new Date().toISOString(),
    });
    setReplyMessage(rm => ({ ...rm, [ticket.id]: "" }));
    setSubmitting(false);
    fetchReplies([ticket.id]);
    fetchTickets();
  };

  // Update ticket status (admin only)
  const updateStatus = async (ticket: Ticket, status: string) => {
    setUpdating(ticket.id);
    await supabase
      .from("support_tickets")
      .update({ status })
      .eq("id", ticket.id);
    setUpdating(null);
    fetchTickets();
  };

  // Replies for a given ticket
  const getReplies = (ticketId: string) =>
    replies.filter(r => r.ticket_id === ticketId);

  return (
    <div>
      <h4>Support Tickets</h4>
      {user.isAdmin && (
        <div style={{ marginBottom: 12 }}>
          <label>
            <input
              type="checkbox"
              checked={adminView}
              onChange={e => setAdminView(e.target.checked)}
            />{" "}
            Admin View (see all tickets)
          </label>
        </div>
      )}

      {/* New Ticket Form (users only, not admin view) */}
      {!adminView && (
        <>
          <textarea
            placeholder="Describe your issue"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={3}
            style={{ width: "100%", marginBottom: 8 }}
            disabled={submitting}
          />
          <button onClick={createTicket} disabled={!message.trim() || submitting}>
            {submitting ? "Submitting..." : "Submit Ticket"}
          </button>
        </>
      )}

      <div style={{ margin: "16px 0" }}>
        {loading ? (
          <div>Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div>No tickets yet.</div>
        ) : (
          <ul>
            {tickets.map(t => (
              <li key={t.id} style={{ border: "1px solid #ccc", borderRadius: 6, marginBottom: 16, padding: 12 }}>
                <div>
                  <b>{t.status === "open" ? "🟢" : t.status === "pending" ? "🟡" : "⚪"} {t.status.toUpperCase()}</b>
                  <span style={{ color: "#888", marginLeft: 8 }}>
                    {new Date(t.created_at).toLocaleString()}
                  </span>
                  {user.isAdmin && (
                    <span style={{ marginLeft: 16 }}>
                      <select
                        value={t.status}
                        disabled={updating === t.id}
                        onChange={e => updateStatus(t, e.target.value)}
                        style={{ marginLeft: 8 }}
                      >
                        <option value="open">Open</option>
                        <option value="pending">Pending</option>
                        <option value="closed">Closed</option>
                      </select>
                      {updating === t.id && <span style={{ marginLeft: 8 }}>Updating...</span>}
                    </span>
                  )}
                </div>
                <div style={{ marginBottom: 10, marginTop: 8 }}>{t.message}</div>

                {/* Replies */}
                <div style={{ marginLeft: 10 }}>
                  {getReplies(t.id).map(r => (
                    <div key={r.id} style={{ marginBottom: 6, paddingLeft: 8, borderLeft: "2px solid #eee" }}>
                      <span style={{ fontWeight: 500 }}>{r.user_id === user.id ? "You" : r.user_id}:</span>
                      <span style={{ marginLeft: 6 }}>{r.message}</span>
                      <span style={{ color: "#aaa", marginLeft: 8, fontSize: 12 }}>
                        {new Date(r.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Reply box (if ticket open, any user or admin can reply) */}
                {t.status !== "closed" && (
                  <div style={{ marginTop: 8 }}>
                    <textarea
                      value={replyMessage[t.id] || ""}
                      onChange={e =>
                        setReplyMessage(rm => ({ ...rm, [t.id]: e.target.value }))
                      }
                      rows={2}
                      style={{ width: "100%", marginBottom: 4 }}
                      placeholder="Add a reply..."
                      disabled={submitting}
                    />
                    <button
                      onClick={() => addReply(t)}
                      disabled={!replyMessage[t.id]?.trim() || submitting}
                    >
                      {submitting ? "Replying..." : "Reply"}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
