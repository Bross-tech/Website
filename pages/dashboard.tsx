import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";

export default function Dashboard() {
  return (
    <AuthLayout>
      <h1 className="text-3xl font-bold mb-4 text-center">Dashboard</h1>
      <ul className="space-y-3">
        <li>
          <Link href="/orders" className="text-blue-600 hover:underline">
            My Orders
          </Link>
        </li>
        <li>
          <Link href="/complaints" className="text-blue-600 hover:underline">
            My Complaints
          </Link>
        </li>
        <li>
          <Link href="/wallet" className="text-blue-600 hover:underline">
            My Wallet
          </Link>
        </li>
      </ul>
    </AuthLayout>
  );
}
