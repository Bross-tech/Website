import AuthLayout from "@/components/AuthLayout";
import WhatsAppSupport from "@/components/WhatsAppSupport";

export default function Dashboard() {
  return (
    <AuthLayout>
      <div className="p-6 bg-white rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Dashboard Page</h1>
        <p>This is the dashboard page content.</p>
      </div>
      <WhatsAppSupport />
    </AuthLayout>
  );
}
