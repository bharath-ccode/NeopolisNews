"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  FolderKanban,
  HardHat,
  Megaphone,
  LogOut,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import { BuilderAuthProvider, useBuilderAuth } from "@/context/BuilderAuthContext";

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV = [
  { href: "/builder",                  label: "Dashboard",        icon: LayoutDashboard },
  { href: "/builder/projects",         label: "My Projects",      icon: FolderKanban    },
  { href: "/builder/launches/create",  label: "Announce Launch",  icon: Megaphone       },
];

// ─── Inner shell (needs auth context) ────────────────────────────────────────

function BuilderShell({ children }: { children: React.ReactNode }) {
  const { builder, loading, logout } = useBuilderAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !builder && pathname !== "/builder/login") {
      router.replace("/builder/login");
    }
  }, [loading, builder, pathname, router]);

  // Show nothing while redirecting
  if (!loading && !builder && pathname !== "/builder/login") return null;

  // Login page renders without shell
  if (pathname === "/builder/login") return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* ── Sidebar ── */}
      <aside className="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <Link href="/builder" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">
              Builder Portal
            </span>
          </Link>
        </div>

        {/* Builder info */}
        <div className="px-4 py-3 border-b border-gray-50">
          <p className="text-xs font-semibold text-gray-900 truncate">
            {builder?.builderName}
          </p>
          <p className="text-xs text-gray-400 truncate">{builder?.email}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {NAV.map((item) => {
            const active =
              item.href === "/builder"
                ? pathname === "/builder"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}

          {/* Construction Update shortcut */}
          <div className="pt-2 border-t border-gray-100 mt-2">
            <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Quick Post
            </p>
            <Link
              href="/builder/projects"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <HardHat className="w-4 h-4 shrink-0" />
              Construction Update
              <ChevronRight className="w-3.5 h-3.5 ml-auto text-gray-300" />
            </Link>
          </div>
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4">
          <button
            onClick={async () => {
              await logout();
              router.push("/builder/login");
            }}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}

// ─── Root layout (wraps with provider) ───────────────────────────────────────

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BuilderAuthProvider>
      <BuilderShell>{children}</BuilderShell>
    </BuilderAuthProvider>
  );
}
