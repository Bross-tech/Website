import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Utility for formatting Ghanaian Cedi
function formatCurrency(amount: number) {
  return amount.toLocaleString("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

type Wallet = {
  balance: number;
  user_id?: string;
};

type Purchase = {
  amount: number;
  created_at: string;
  user_id?: string;
};

type User = {
  id: string;
  created_at: string;
};

type AdvancedStats = {
  totalUsers: number;
  newUsersToday: number;
  totalPurchases: number;
  purchasesToday: number;
  totalPurchaseAmount: number;
  purchaseAmountToday: number;
  totalWallet: number;
  averageWallet: number;
  topUserId?: string;
  topUserBalance?: number;
};

export function SystemAnalytics() {
  const [stats, setStats] = useState<AdvancedStats>({
    totalUsers: 0,
    newUsersToday: 0,
    totalPurchases: 0,
    purchasesToday: 0,
    totalPurchaseAmount: 0,
    purchaseAmountToday: 0,
    totalWallet: 0,
    averageWallet: 0,
    topUserId: undefined,
    topUserBalance: undefined,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Utility for today checking
  function isToday(dateStr: string) {
    const today = new Date();
    const date = new Date(dateStr);
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  async function fetchStats() {
    try {
      setLoading(true);

      // Fetch only necessary columns
      const [usersRes, purchasesRes, walletsRes] = await Promise.all([
        supabase.from("users").select("id,created_at"),
        supabase.from("purchases").select("amount,created_at,user_id"),
        supabase.from("wallets").select("balance,user_id"),
      ]);

      if (usersRes.error || purchasesRes.error || walletsRes.error) {
        throw new Error(
          usersRes.error?.message ||
            purchasesRes.error?.message ||
            walletsRes.error?.message ||
            "Unknown error"
        );
      }

      const users = usersRes.data as User[];
      const purchases = purchasesRes.data as Purchase[];
      const wallets = walletsRes.data as Wallet[];

      // User stats
      const totalUsers = users.length;
      const newUsersToday = users.filter((u) => u.created_at && isToday(u.created_at)).length;

      // Purchase stats
      const totalPurchases = purchases.length;
      const purchasesTodayArr = purchases.filter(
        (p) => p.created_at && isToday(p.created_at)
      );
      const purchasesToday = purchasesTodayArr.length;
      const totalPurchaseAmount = purchases.reduce(
        (sum, p) => sum + (p.amount || 0),
        0
      );
      const purchaseAmountToday = purchasesTodayArr.reduce(
        (sum, p) => sum + (p.amount || 0),
        0
      );

      // Wallet stats
      const totalWallet = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
      const averageWallet = wallets.length
        ? totalWallet / wallets.length
        : 0;

      // Top wallet holder
      let topUserId: string | undefined = undefined;
      let topUserBalance: number | undefined = undefined;
      if (wallets.length) {
        const top = wallets.reduce(
          (max, w) => (w.balance > (max.balance || 0) ? w : max),
          wallets[0]
        );
        topUserId = top.user_id;
        topUserBalance = top.balance;
      }

      setStats({
        totalUsers,
        newUsersToday,
        totalPurchases,
        purchasesToday,
        totalPurchaseAmount,
        purchaseAmountToday,
        totalWallet,
        averageWallet,
        topUserId,
        topUserBalance,
      });
    } catch (err: any) {
      setError(err?.message || "Error fetching analytics");
    } finally {
      setLoading(false);
    }
  }

  // Initial fetch and subscribe for real-time updates
  useEffect(() => {
    fetchStats();

    // Subscribe to changes in users, purchases, and wallets
    const usersSub = supabase
      .channel("users_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        fetchStats
      )
      .subscribe();

    const purchasesSub = supabase
      .channel("purchases_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "purchases" },
        fetchStats
      )
      .subscribe();

    const walletsSub = supabase
      .channel("wallets_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "wallets" },
        fetchStats
      )
      .subscribe();

    return () => {
      usersSub.unsubscribe();
      purchasesSub.unsubscribe();
      walletsSub.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div>Error loading analytics: {error}</div>;

  return (
    <div>
      <h3>System Analytics</h3>
      <div><b>Total Users:</b> {stats.totalUsers}</div>
      <div><b>New Users Today:</b> {stats.newUsersToday}</div>
      <div><b>Total Purchases:</b> {stats.totalPurchases}</div>
      <div><b>Purchases Today:</b> {stats.purchasesToday}</div>
      <div><b>Total Purchase Amount:</b> {formatCurrency(stats.totalPurchaseAmount)}</div>
      <div><b>Purchase Amount Today:</b> {formatCurrency(stats.purchaseAmountToday)}</div>
      <div><b>Total Wallet Balance:</b> {formatCurrency(stats.totalWallet)}</div>
      <div><b>Average Wallet Balance:</b> {formatCurrency(stats.averageWallet)}</div>
      {stats.topUserId && (
        <div>
          <b>Top Wallet Holder:</b> User ID {stats.topUserId} (
          {formatCurrency(stats.topUserBalance ?? 0)})
        </div>
      )}
    </div>
  );
}
