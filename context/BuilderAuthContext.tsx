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
import { Builder, getBuilderByEmail } from "@/lib/buildersStore";

// ─── Types ───────────────────────────────────────────────────────────────────

interface BuilderAuthContextValue {
  supaUser: User | null;
  builder: Builder | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<"ok" | "not_builder" | "invalid_credentials" | "error">;
  logout: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const BuilderAuthContext = createContext<BuilderAuthContextValue | null>(null);

export function BuilderAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [supaUser, setSupaUser] = useState<User | null>(null);
  const [builder, setBuilder] = useState<Builder | null>(null);
  const [loading, setLoading] = useState(true);

  async function resolveBuilder(user: User | null) {
    if (!user?.email) {
      setBuilder(null);
      return;
    }
    const b = await getBuilderByEmail(user.email);
    setBuilder(b);
  }

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data }) => {
      setSupaUser(data.user ?? null);
      await resolveBuilder(data.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSupaUser(session?.user ?? null);
        await resolveBuilder(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string
    ): Promise<"ok" | "not_builder" | "invalid_credentials" | "error"> => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (
          msg.includes("invalid") ||
          msg.includes("credentials") ||
          error.status === 400 ||
          error.status === 401
        )
          return "invalid_credentials";
        return "error";
      }

      if (!data.user) return "error";

      // Verify the user has a matching builder record
      const b = await getBuilderByEmail(email);
      if (!b) {
        // Not a builder — sign them back out
        await supabase.auth.signOut();
        return "not_builder";
      }

      return "ok";
    },
    []
  );

  const logout = useCallback(async () => {
    await createClient().auth.signOut();
    setSupaUser(null);
    setBuilder(null);
  }, []);

  return (
    <BuilderAuthContext.Provider
      value={{ supaUser, builder, loading, login, logout }}
    >
      {children}
    </BuilderAuthContext.Provider>
  );
}

export function useBuilderAuth() {
  const ctx = useContext(BuilderAuthContext);
  if (!ctx)
    throw new Error("useBuilderAuth must be used within BuilderAuthProvider");
  return ctx;
}
