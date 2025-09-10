import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Install recharts if you haven't: npm install recharts
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend
} from "recharts";

type User = { id: string };
type Purchase = {
  id: string;
  bundle: string;
  price: number;
  created_at: string;
};

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

const PIE_COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c", "#d0ed57", "#ffbb28", "#0088FE", "#00C49F", "#FFBB28"
];

export function PurchaseAnalytics({ user }: { user: User }) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  // Date filters
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const [startDate, setStartDate] = useState(formatDate(sevenDaysAgo));
  const [endDate, setEndDate] = useState(formatDate(today));

  useEffect(() => {
    let isMounted = true;
    const fetchPurchases = async () => {
      setLoading(true);
      let query = supabase.from("purchases").select("*").eq("user_id", user.id);
      if (startDate) query = query.gte("created_at", startDate);
      if (endDate) {
        // Add a day for inclusive end date
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        query = query.lt("created_at", formatDate(end));
      }
      const { data, error } = await query.order("created_at", { ascending: false });
      if (isMounted) setPurchases(data || []);
      setLoading(false);
    };
    fetchPurchases();
    return () => {
      isMounted = false;
    };
  }, [user.id, startDate, endDate]);

  // Total spent
  const totalSpent = purchases.reduce((sum, p) => sum + (Number(p.price) || 0), 0);

  // Prepare data for charts: group by bundle
  const bundleStats = purchases.reduce<Record<string, number>>((acc, p) => {
    acc[p.bundle] = (acc[p.bundle] || 0) + (Number(p.price) || 0);
    return acc;
  }, {});
  const bundleData = Object.entries(bundleStats).map(([bundle, amount]) => ({
    bundle,
    amount,
  }));

  // Purchases per day for the selected range
  const dayStats: Record<string, number> = {};
  purchases.forEach(p => {
    const date = p.created_at.slice(0, 10);
    dayStats[date] = (dayStats[date] || 0) + (Number(p.price) || 0);
  });
  const dayData = Object.entries(dayStats)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount }));

  // Pie chart data
  const pieData = bundleData.map(({ bundle, amount }) => ({
    name: bundle,
    value: amount,
  }));

  return (
    <div>
      <h4>Purchase Analytics</h4>
      <form style={{ marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}
        onSubmit={e => e.preventDefault()}>
        <label>
          Start:
          <input type="date" value={startDate} max={endDate}
            onChange={e => setStartDate(e.target.value)} />
        </label>
        <label>
          End:
          <input type="date" value={endDate} min={startDate}
            onChange={e => setEndDate(e.target.value)} />
        </label>
      </form>
      {loading ? (
        <div>Loading purchases...</div>
      ) : (
        <>
          <ul>
            {purchases.length === 0 && <li>No purchases found.</li>}
            {purchases.map(p => (
              <li key={p.id}>
                {p.bundle}: GHS {p.price} <span style={{ color: "#888", fontSize: 12 }}>({p.created_at.slice(0, 10)})</span>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 16, fontWeight: "bold" }}>
            Total Spent: GHS {totalSpent}
          </div>
          <div style={{ margin: "32px 0" }}>
            <h5>Spending by Bundle (Bar Chart)</h5>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={bundleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bundle" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#2196f3" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ margin: "32px 0" }}>
            <h5>Spending by Bundle (Pie Chart)</h5>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ margin: "32px 0" }}>
            <h5>Spending Over Time</h5>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
