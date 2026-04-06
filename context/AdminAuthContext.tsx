"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AdminAuthContextValue {
  admin: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<"ok" | "invalid_credentials" | "error">;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<"ok" | "wrong_current" | "error">;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(({ data }) => {
      setAdmin(data.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAdmin(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<"ok" | "invalid_credentials" | "error"> => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) return "ok";
      if (error.message.toLowerCase().includes("invalid")) return "invalid_credentials";
      return "error";
    },
    []
  );

  const logout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setAdmin(null);
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<"ok" | "wrong_current" | "error"> => {
      const supabase = createClient();

      // Re-authenticate with current password to verify it's correct
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.email) return "error";

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: currentPassword,
      });
      if (verifyError) return "wrong_current";

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) return "error";

      return "ok";
    },
    []
  );

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout, changePassword }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx)
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
