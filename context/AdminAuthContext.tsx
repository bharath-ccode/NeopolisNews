"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AdminUser {
  email: string;
  name: string;
}

interface AdminAuthContextValue {
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<"ok" | "wrong_current">;
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const ADMIN_SESSION_KEY = "neopolis_admin";
const ADMIN_PWD_KEY     = "neopolis_admin_pwd";

// Default credentials — overridden once the admin changes the password
const DEFAULT_EMAIL    = "admin@neopolisnews.com";
const DEFAULT_PASSWORD = "admin123";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStoredPassword(): string {
  if (typeof window === "undefined") return DEFAULT_PASSWORD;
  return localStorage.getItem(ADMIN_PWD_KEY) ?? DEFAULT_PASSWORD;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ADMIN_SESSION_KEY);
      if (raw) setAdmin(JSON.parse(raw) as AdminUser);
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      // In production: POST /api/admin/auth/login
      const storedPassword = getStoredPassword();
      if (
        email.trim().toLowerCase() === DEFAULT_EMAIL &&
        password === storedPassword
      ) {
        const adminUser: AdminUser = { email: DEFAULT_EMAIL, name: "Admin" };
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminUser));
        setAdmin(adminUser);
        return true;
      }
      return false;
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setAdmin(null);
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<"ok" | "wrong_current"> => {
      // In production: POST /api/admin/auth/change-password
      const storedPassword = getStoredPassword();
      if (currentPassword !== storedPassword) {
        return "wrong_current";
      }
      localStorage.setItem(ADMIN_PWD_KEY, newPassword);
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
