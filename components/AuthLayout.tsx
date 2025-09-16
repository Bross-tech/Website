import { ReactNode } from "react";
import { useRouter } from "next/router";
import { useEffect } from "react";

type Props = { children: ReactNode };

export default function AuthLayout({ children }: Props) {
  const router = useRouter();
  const isLoggedIn = typeof window !== "undefined" && localStorage.getItem("user");

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      {children}
    </div>
  );
}
