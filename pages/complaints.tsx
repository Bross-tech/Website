import AuthLayout from "@/components/AuthLayout";
import WhatsAppSupport from "@/components/WhatsAppSupport";

export default function Complaints() {
  return (
    <AuthLayout>
      <div className="p-6 bg-white rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Complaints Page</h1>
        <p>This is the complaints page content.</p>
      </div>
      <WhatsAppSupport />
    </AuthLayout>
  );
}
