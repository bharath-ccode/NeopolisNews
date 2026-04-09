"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type UserType = "individual" | "business";

export interface BusinessHours {
  open: string;   // "09:00" 24-hour format
  close: string;  // "22:00"
  days: string[]; // e.g. ["Mon","Tue","Wed","Thu","Fri","Sat"]
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  userType: UserType;
  avatar?: string;
  // Individual fields
  location?: string;
  // Business fields
  businessName?: string;
  businessType?: string;    // group: "Lifestyle" | "Health" | "Events"
  businessSubType?: string; // specific: "Hospital" | "Diagnostics" | "Restaurant" etc.
  businessCategory?: string;
  businessHours?: BusinessHours;
  emergencyPhone?: string; // hospitals / clinics only
  gstin?: string;
  createdAt: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  loginWithGoogle: (userType: UserType) => Promise<void>;
  loginWithEmail: (
    email: string,
    password: string,
    userType: UserType
  ) => Promise<void>;
  loginWithOtp: (contact: string, otp: string, userType: UserType) => Promise<void>;
  sendOtp: (contact: string) => Promise<void>;
  verifyOtp: (contact: string, otp: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

export interface RegisterData {
  userType: UserType;
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  // Business
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

const STORAGE_KEY = "neopolis_user";

function makeMockUser(data: Partial<User> & { userType: UserType }): User {
  return {
    id: Math.random().toString(36).slice(2),
    name: data.name ?? "Neopolis User",
    email: data.email,
    phone: data.phone,
    userType: data.userType,
    avatar: undefined,
    businessName: data.businessName,
    businessType: data.businessType,
    businessSubType: data.businessSubType,
    businessCategory: data.businessCategory,
    businessHours: data.businessHours,
    emergencyPhone: data.emergencyPhone,
    gstin: data.gstin,
    createdAt: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  function persist(u: User) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  }

  const loginWithGoogle = useCallback(async (userType: UserType) => {
    // In production: trigger Google OAuth flow
    const u = makeMockUser({
      userType,
      name: "Google User",
      email: "user@gmail.com",
    });
    persist(u);
  }, []);

  const loginWithEmail = useCallback(
    async (email: string, _password: string, userType: UserType) => {
      // In production: POST /api/auth/login { email, password }
      const u = makeMockUser({ userType, name: email.split("@")[0], email });
      persist(u);
    },
    []
  );

  const sendOtp = useCallback(async (_contact: string) => {
    // In production: POST /api/auth/otp/send { contact }
    await new Promise((r) => setTimeout(r, 600));
  }, []);

  const loginWithOtp = useCallback(
    async (contact: string, _otp: string, userType: UserType) => {
      // In production: POST /api/auth/otp/verify { contact, otp }
      const isEmail = contact.includes("@");
      const u = makeMockUser({
        userType,
        name: isEmail ? contact.split("@")[0] : `User ${contact.slice(-4)}`,
        ...(isEmail ? { email: contact } : { phone: contact }),
      });
      persist(u);
    },
    []
  );

  const verifyOtp = useCallback(async (_contact: string, _otp: string) => {
    // In production: POST /api/auth/otp/verify { contact, otp }
    // Throws with an error message if OTP is invalid
    await new Promise((r) => setTimeout(r, 600));
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    // In production: POST /api/auth/register
    const u = makeMockUser(data);
    persist(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
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
