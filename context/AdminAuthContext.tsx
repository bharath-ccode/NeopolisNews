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
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ADMIN_STORAGE_KEY = "neopolis_admin";
// Default credentials — change in production
const ADMIN_EMAIL = "admin@neopolisnews.com";
const ADMIN_PASSWORD = "admin123";

// ─── Context ─────────────────────────────────────────────────────────────────

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (raw) setAdmin(JSON.parse(raw) as AdminUser);
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      // In production: POST /api/admin/auth/login
      if (
        email.trim().toLowerCase() === ADMIN_EMAIL &&
        password === ADMIN_PASSWORD
      ) {
        const adminUser: AdminUser = { email: ADMIN_EMAIL, name: "Admin" };
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
        setAdmin(adminUser);
        return true;
      }
      return false;
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setAdmin(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
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
