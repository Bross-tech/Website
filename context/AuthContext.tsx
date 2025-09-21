// context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type AuthContextType = {
  userId: string | null;
  role: "customer" | "agent" | "admin" | null;
  wallet: number;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  userId: null,
  role: null,
  wallet: 0,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<"customer" | "agent" | "admin" | null>(null);
  const [wallet, setWallet] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async (uid: string) => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, wallet")
        .eq("id", uid)
        .single();

      if (!error && profile) {
        setRole(profile.role);
        setWallet(profile.wallet ?? 0);
      }
    };

    // 🔐 Watch auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (uid) loadProfile(uid);
      else {
        setRole(null);
        setWallet(0);
      }
      setLoading(false);
    });

    // ✅ Initial session load
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (uid) loadProfile(uid);
      else {
        setRole(null);
        setWallet(0);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ userId, role, wallet, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
