"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Newspaper,
  BarChart3,
  LogOut,
  ChevronRight,
  Building2,
  Store,
  PlusCircle,
  Loader2,
  ExternalLink,
  Settings,
  HardHat,
  Layers,
  Home,
} from "lucide-react";
import clsx from "clsx";
import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";

const NAV = [
  { href: "/admin",               icon: LayoutDashboard, label: "Dashboard"     },
  { href: "/admin/news",          icon: Newspaper,       label: "News Articles" },
  { href: "/admin/builders",      icon: HardHat,         label: "Builders"      },
  { href: "/admin/projects",      icon: Layers,          label: "Projects"      },
  { href: "/admin/businesses",    icon: Store,           label: "Businesses"    },
  { href: "/admin/classifieds",   icon: Home,            label: "Classifieds"   },
  { href: "/admin/analytics",     icon: BarChart3,       label: "Analytics"     },
  { href: "/admin/settings",      icon: Settings,        label: "Settings"      },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const { admin, loading, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!loading && !admin && !isLoginPage) {
      router.push("/admin/login");
    }
  }, [admin, loading, isLoginPage, router]);

  // Render login page without sidebar
  if (isLoginPage) return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!admin) return null;

  async function handleLogout() {
    await logout();
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Sidebar ── */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col shrink-0 hidden md:flex">
        {/* Brand */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">
              Neopolis<span className="text-brand-600">News</span>
            </span>
          </div>
          <span className="mt-1.5 inline-block text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Admin Portal
          </span>
        </div>

        {/* Admin info */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
              A
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {admin.user_metadata?.name ?? admin.email}
              </p>
              <p className="text-xs text-gray-400 truncate">{admin.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={clsx(
                    "w-4 h-4 shrink-0",
                    active ? "text-brand-600" : "text-gray-400"
                  )}
                />
                {item.label}
                {active && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-brand-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-3 border-t border-gray-100 space-y-0.5">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" />
            View Website
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3 md:hidden z-40">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center">
            <Building2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900">
            Neopolis<span className="text-brand-600">News</span>{" "}
            <span className="text-gray-400 font-normal">Admin</span>
          </span>
        </div>
        <div className="flex gap-1">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "p-2 rounded-lg transition-colors",
                  active
                    ? "bg-brand-50 text-brand-600"
                    : "text-gray-400 hover:bg-gray-50"
                )}
                title={item.label}
              >
                <item.icon className="w-4 h-4" />
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 pt-14 md:pt-0 overflow-auto">
        {/* Top bar (desktop) */}
        <div className="hidden md:flex bg-white border-b border-gray-100 px-8 py-4 items-center justify-between">
          <div>
            <h1 className="font-bold text-gray-900">
              {NAV.find((n) =>
                n.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(n.href)
              )?.label ?? "Admin"}
            </h1>
            <p className="text-xs text-gray-400">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          {pathname !== "/admin/settings" && (
            <Link href="/admin/news/create" className="btn-primary text-sm py-2">
              <PlusCircle className="w-3.5 h-3.5" />
              New Article
            </Link>
          )}
        </div>

        <div className="p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
