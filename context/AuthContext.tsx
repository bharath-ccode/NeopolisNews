"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export type UserType = "individual" | "business";

export interface BusinessHours {
  open: string;
  close: string;
  days: string[];
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  userType: UserType;
  avatar?: string;
  location?: string;
  // Business fields kept for API compatibility — populated only when the
  // same account is also a business owner (future use).
  businessName?: string;
  businessType?: string;
  businessSubType?: string;
  businessCategory?: string;
  businessHours?: BusinessHours;
  emergencyPhone?: string;
  gstin?: string;
  createdAt: string;
}

export interface ProfileUpdate {
  name?: string;
  phone?: string;
  location?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  loginWithGoogle: (userType: UserType) => Promise<void>;
  loginWithEmail: (email: string, password: string, userType: UserType) => Promise<void>;
  loginWithOtp: (contact: string, otp: string, userType: UserType) => Promise<void>;
  sendOtp: (contact: string) => Promise<void>;
  verifyOtp: (contact: string, otp: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  logout: () => void;
}

export interface RegisterData {
  userType: UserType;
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  businessName?: string;
  businessType?: string;
  businessSubType?: string;
  businessCategory?: string;
  businessHours?: BusinessHours;
  emergencyPhone?: string;
  gstin?: string;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// Module-level singleton so the same client is reused across re-renders.
const supabase = createClient();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Build a User object from an auth.users row + user_profiles row.
  const loadProfile = useCallback(async (authUser: SupabaseUser) => {
    const { data } = await supabase
      .from("user_profiles")
      .select("name, phone, avatar_url, location")
      .eq("user_id", authUser.id)
      .maybeSingle();

    setUser({
      id: authUser.id,
      name: data?.name || authUser.email?.split("@")[0] || "User",
      email: authUser.email ?? undefined,
      phone: authUser.phone ?? data?.phone ?? undefined,
      userType: "individual",
      avatar: data?.avatar_url ?? undefined,
      location: data?.location ?? undefined,
      createdAt: authUser.created_at,
    });
    setLoading(false);
  }, []);

  // Restore session on mount and listen for future changes.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          loadProfile(session.user);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [loadProfile]);

  // ── Auth actions ─────────────────────────────────────────────────────────

  const sendOtp = useCallback(async (contact: string) => {
    const isEmail = contact.includes("@");
    const { error } = isEmail
      ? await supabase.auth.signInWithOtp({ email: contact })
      : await supabase.auth.signInWithOtp({ phone: contact });
    if (error) throw new Error(error.message);
  }, []);

  // Verify OTP issued by sendOtp — used in the registration flow before
  // calling register().  Establishes the Supabase session.
  const verifyOtp = useCallback(async (contact: string, token: string) => {
    const isEmail = contact.includes("@");
    const { error } = isEmail
      ? await supabase.auth.verifyOtp({ email: contact, token, type: "email" })
      : await supabase.auth.verifyOtp({ phone: contact, token, type: "sms" });
    if (error) throw new Error(error.message);
  }, []);

  // OTP login (no separate register step needed — profile loaded from DB).
  const loginWithOtp = useCallback(
    async (contact: string, token: string, _userType: UserType) => {
      const isEmail = contact.includes("@");
      const { error } = isEmail
        ? await supabase.auth.verifyOtp({ email: contact, token, type: "email" })
        : await supabase.auth.verifyOtp({ phone: contact, token, type: "sms" });
      if (error) throw new Error(error.message);
      // onAuthStateChange → loadProfile handles state update.
    },
    []
  );

  const loginWithEmail = useCallback(
    async (email: string, password: string, _userType: UserType) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
    },
    []
  );

  // Creates / updates the user_profiles row after OTP verification.
  // Also handles the case where the account already exists (e.g. a business
  // owner registering as an individual) — upsert is idempotent.
  const register = useCallback(
    async (data: RegisterData) => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error("Not authenticated. Please verify OTP first.");

      const { error } = await supabase.from("user_profiles").upsert(
        {
          user_id: authUser.id,
          name: data.name,
          phone: data.phone ?? null,
        },
        { onConflict: "user_id" }
      );
      if (error) throw new Error(error.message);
      await loadProfile(authUser);
    },
    [loadProfile]
  );

  const updateProfile = useCallback(
    async (updates: ProfileUpdate) => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("user_id", authUser.id);
      if (error) throw new Error(error.message);
      setUser((prev) => (prev ? { ...prev, ...updates } : prev));
    },
    []
  );

  const changePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  }, []);

  // Google OAuth — redirect-based, works on both web and mobile WebView.
  const loginWithGoogle = useCallback(async (_userType: UserType) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw new Error(error.message);
  }, []);

  const logout = useCallback(() => {
    supabase.auth.signOut(); // fires onAuthStateChange → setUser(null)
    setUser(null);           // immediate UI update
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginWithEmail,
        loginWithOtp,
        sendOtp,
        verifyOtp,
        register,
        updateProfile,
        changePassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
