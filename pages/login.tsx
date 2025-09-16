import AuthLayout from "@/components/AuthLayout";
import WhatsAppSupport from "@/components/WhatsAppSupport";

export default function Login() {
  return (
    <AuthLayout>
      <div className="p-6 bg-white rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Login Page</h1>
        <p>This is the login page content.</p>
      </div>
      <WhatsAppSupport />
    </AuthLayout>
  );
}
