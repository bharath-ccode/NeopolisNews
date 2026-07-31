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
import { Broker, getBrokerByEmail } from "@/lib/brokersStore";

interface BrokerAuthContextValue {
  supaUser: User | null;
  broker: Broker | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<"ok" | "not_broker" | "invalid_credentials" | "error">;
  logout: () => Promise<void>;
}

const BrokerAuthContext = createContext<BrokerAuthContextValue | null>(null);

export function BrokerAuthProvider({ children }: { children: React.ReactNode }) {
  const [supaUser, setSupaUser] = useState<User | null>(null);
  const [broker,   setBroker]   = useState<Broker | null>(null);
  const [loading,  setLoading]  = useState(true);

  async function resolveBroker(user: User | null) {
    if (!user?.email) { setBroker(null); return; }
    const b = await getBrokerByEmail(user.email);
    setBroker(b);
  }

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data }) => {
      setSupaUser(data.user ?? null);
      await resolveBroker(data.user ?? null);
    }).catch(() => {
      setSupaUser(null);
      setBroker(null);
    }).finally(() => setLoading(false));

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSupaUser(session?.user ?? null);
        await resolveBroker(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<"ok" | "not_broker" | "invalid_credentials" | "error"> => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("invalid") || msg.includes("credentials") || error.status === 400 || error.status === 401)
          return "invalid_credentials";
        return "error";
      }

      if (!data.user) return "error";

      const b = await getBrokerByEmail(email);
      if (!b) {
        await supabase.auth.signOut();
        return "not_broker";
      }

      return "ok";
    },
    []
  );

  const logout = useCallback(async () => {
    await createClient().auth.signOut();
    setSupaUser(null);
    setBroker(null);
  }, []);

  return (
    <BrokerAuthContext.Provider value={{ supaUser, broker, loading, login, logout }}>
      {children}
    </BrokerAuthContext.Provider>
  );
}

export function useBrokerAuth() {
  const ctx = useContext(BrokerAuthContext);
  if (!ctx) throw new Error("useBrokerAuth must be used within BrokerAuthProvider");
  return ctx;
}
