import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
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
    </div>
  );
}
