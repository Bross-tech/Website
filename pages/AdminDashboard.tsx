import AdminDashboard from "../components/AdminDashboard";

export default function AdminDashboardPage() {
  const user = { id: "dummy-admin-id" }; // TODO: replace with actual logged-in user
  return <AdminDashboard user={user} />;
}
