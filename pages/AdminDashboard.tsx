import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
const AdminDashboard = dynamic(() => import("../components/AdminDashboard"), { ssr: false });

export default function AdminDashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // get current user (client side)
    import("../lib/supabaseClient").then(({ supabase }) => {
      supabase.auth.getUser().then(({ data }) => setUser(data.user));
    });
  }, []);

  if (!user) return <div>Please login as admin</div>;
  return <AdminDashboard user={user} />;
}
