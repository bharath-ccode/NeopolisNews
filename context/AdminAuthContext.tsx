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
  login: (email: string, password: string) => Promise<"ok" | "not_admin" | "invalid_credentials" | "timeout" | "error">;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<"ok" | "wrong_current" | "error">;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Race a promise against a timeout; throws on timeout. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
}

/** Returns true if this Supabase user is a builder (has a row in builders table). */
async function isBuilder(email: string | undefined): Promise<boolean> {
  if (!email) return false;
  const { data } = await createClient()
    .from("builders")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  return !!data;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const supabase = createClient();
        const { data } = await withTimeout(supabase.auth.getUser(), 8000);
        if (!mounted) return;
        const user = data.user ?? null;
        const builder = await withTimeout(isBuilder(user?.email), 4000).catch(() => false);
        setAdmin(builder ? null : user);
      } catch {
        if (mounted) setAdmin(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    // Hard timeout: never spin forever even if Supabase hangs
    const timeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 5000);

    init().then(() => clearTimeout(timeout));

    // Listen for auth changes
    let unsubscribe: (() => void) | null = null;
    try {
      const supabase = createClient();
      const { data: listener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          const user = session?.user ?? null;
          // Run async work in background — do NOT await here or it blocks signInWithPassword
          void (async () => {
            try {
              const builder = await withTimeout(isBuilder(user?.email), 4000).catch(() => false);
              setAdmin(builder ? null : user);
            } catch {
              setAdmin(null);
            }
          })();
        }
      );
      unsubscribe = () => listener.subscription.unsubscribe();
    } catch {
      // Auth listener failed — not critical, init() already ran
    }

    return () => {
      mounted = false;
      clearTimeout(timeout);
      unsubscribe?.();
    };
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string
    ): Promise<"ok" | "not_admin" | "invalid_credentials" | "timeout" | "error"> => {
      try {
        const supabase = createClient();
        const { data, error } = await withTimeout(
          supabase.auth.signInWithPassword({ email, password }),
          10000
        );

        if (error) {
          const msg = error.message.toLowerCase();
          if (
            msg.includes("invalid") ||
            msg.includes("wrong") ||
            msg.includes("not found") ||
            msg.includes("credentials") ||
            error.status === 400 ||
            error.status === 401
          )
            return "invalid_credentials";
          return "error";
        }

        if (!data.user) return "error";

        // Reject if this account belongs to a builder
        const builderCheck = await withTimeout(isBuilder(data.user.email), 5000).catch(() => false);
        if (builderCheck) {
          await supabase.auth.signOut();
          return "not_admin";
        }

        return "ok";
      } catch (e) {
        if (e instanceof Error && e.message === "timeout") return "timeout";
        return "error";
      }
    },
    []
  );

  const logout = useCallback(async () => {
    await createClient().auth.signOut();
    setAdmin(null);
  }, []);

  const changePassword = useCallback(
    async (
      currentPassword: string,
      newPassword: string
    ): Promise<"ok" | "wrong_current" | "error"> => {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.email) return "error";

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: currentPassword,
      });
      if (verifyError) return "wrong_current";

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) return "error";

      return "ok";
    },
    []
  );

  return (
    <AdminAuthContext.Provider
      value={{ admin, loading, login, logout, changePassword }}
    >
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
