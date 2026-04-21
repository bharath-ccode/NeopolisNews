"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Home,
  PlusCircle,
  MessageSquare,
  User,
  Building2,
  ShoppingBag,
  BarChart3,
  LogOut,
  ChevronRight,
  Loader2,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import clsx from "clsx";

const INDIVIDUAL_NAV = [
  { href: "/dashboard/individual", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/individual/post", icon: PlusCircle, label: "Post Listing" },
  { href: "/dashboard/individual/listings", icon: Home, label: "My Listings" },
  { href: "/dashboard/individual/enquiries", icon: MessageSquare, label: "Enquiries" },
  { href: "/dashboard/individual/profile", icon: User, label: "My Profile" },
];

const BUSINESS_NAV = [
  { href: "/dashboard/business", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/business/post", icon: PlusCircle, label: "Post Classified" },
  { href: "/dashboard/business/classifieds", icon: ShoppingBag, label: "My Classifieds" },
  { href: "/dashboard/business/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/business/profile", icon: Briefcase, label: "Business Profile" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login?redirect=/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!user) return null;

  const nav = user.userType === "individual" ? INDIVIDUAL_NAV : BUSINESS_NAV;
  const displayName =
    user.userType === "business" ? user.businessName ?? user.name : user.name;

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Sidebar ── */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shrink-0 hidden md:flex">
        {/* Brand */}
        <div className="px-5 py-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">
              Neopolis<span className="text-brand-600">News</span>
            </span>
          </Link>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">
                {displayName}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user.email ?? user.phone}
              </p>
            </div>
          </div>
          <span className={`mt-2 badge text-xs ${user.userType === "individual" ? "tag-blue" : "tag-purple"}`}>
            {user.userType === "individual" ? "Individual" : "Business"}
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href;
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
                <item.icon className={clsx("w-4 h-4 shrink-0", active ? "text-brand-600" : "text-gray-400")} />
                {item.label}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-brand-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 w-full transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom nav ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex md:hidden z-40">
        {nav.slice(0, 5).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors",
                active ? "text-brand-600" : "text-gray-400"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 pb-16 md:pb-0">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-gray-900 text-sm md:text-base">
              {nav.find((n) => n.href === pathname)?.label ?? "Dashboard"}
            </h1>
            <p className="text-xs text-gray-400 hidden md:block">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={user.userType === "individual" ? "/dashboard/individual/post" : "/dashboard/business/post"}
              className="btn-primary text-xs py-2"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              {user.userType === "individual" ? "Post Listing" : "Post Classified"}
            </Link>
          </div>
        </div>

        {/* Page content */}
        <div className="p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
