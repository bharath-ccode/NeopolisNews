"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  ListChecks,
  PlusCircle,
  LogOut,
  Clock,
  XCircle,
} from "lucide-react";
import clsx from "clsx";
import { BrokerAuthProvider, useBrokerAuth } from "@/context/BrokerAuthContext";

const NAV = [
  { href: "/broker",                  label: "Dashboard",       icon: LayoutDashboard },
  { href: "/broker/listings",         label: "My Listings",     icon: ListChecks      },
  { href: "/broker/listings/create",  label: "Add Listing",     icon: PlusCircle      },
];

function BrokerShell({ children }: { children: React.ReactNode }) {
  const { broker, loading, logout } = useBrokerAuth();
  const router   = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === "/broker/login" || pathname === "/broker/register";

  useEffect(() => {
    if (!loading && !broker && !isAuthPage) {
      router.replace("/broker/login");
    }
  }, [loading, broker, isAuthPage, router]);

  if (!loading && !broker && !isAuthPage) return null;

  if (isAuthPage) return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Pending approval screen
  if (broker?.status === "pending") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-amber-200 shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-7 h-7 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Application Under Review</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your broker registration is pending admin approval. You'll be able to post listings
            once your account is verified — usually within 24 hours.
          </p>
          <button
            onClick={async () => { await logout(); router.push("/broker/login"); }}
            className="text-sm text-gray-400 hover:text-gray-600 underline"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // Rejected screen
  if (broker?.status === "rejected") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Application Rejected</h2>
          {broker.rejectionNote && (
            <p className="text-sm bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-red-700 mb-4">
              {broker.rejectionNote}
            </p>
          )}
          <p className="text-sm text-gray-500 mb-6">
            Please contact support if you believe this was an error.
          </p>
          <button
            onClick={async () => { await logout(); router.push("/broker/login"); }}
            className="text-sm text-gray-400 hover:text-gray-600 underline"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-100">
          <Link href="/broker" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">Broker Portal</span>
          </Link>
        </div>

        <div className="px-4 py-3 border-b border-gray-50">
          <p className="text-xs font-semibold text-gray-900 truncate">{broker?.name}</p>
          {broker?.companyName && (
            <p className="text-xs text-gray-500 truncate">{broker.companyName}</p>
          )}
          <p className="text-xs text-gray-400 truncate">{broker?.email}</p>
          {broker?.reraNumber && (
            <p className="text-xs text-brand-600 font-medium mt-0.5">RERA: {broker.reraNumber}</p>
          )}
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {NAV.map((item) => {
            const active =
              item.href === "/broker"
                ? pathname === "/broker"
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
        </nav>

        <div className="px-3 pb-4">
          <button
            onClick={async () => { await logout(); router.push("/broker/login"); }}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}

export default function BrokerLayout({ children }: { children: React.ReactNode }) {
  return (
    <BrokerAuthProvider>
      <BrokerShell>{children}</BrokerShell>
    </BrokerAuthProvider>
  );
}
