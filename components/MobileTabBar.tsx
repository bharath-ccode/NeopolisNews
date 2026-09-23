"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Newspaper, Building2, HeartPulse, Menu, X } from "lucide-react";
import clsx from "clsx";
import { useMobileMenu } from "@/context/MobileMenuContext";

const TABS = [
  { label: "Home",       href: "/",          icon: Home,       match: (p: string) => p === "/" },
  { label: "News",       href: "/news",      icon: Newspaper,  match: (p: string) => p.startsWith("/news") || p.startsWith("/cartoon") || p.startsWith("/polls") },
  { label: "Businesses", href: "/businesses",icon: Building2,  match: (p: string) => p.startsWith("/businesses") },
  { label: "Health",     href: "/health",    icon: HeartPulse, match: (p: string) => p.startsWith("/health") },
] as const;

/** Fixed bottom tab bar shown only on mobile-width viewports — the app-like
 *  navigation home; hidden at md and up where the full top navbar already
 *  covers this. "More" drives the same drawer as the navbar's hamburger
 *  (shared state via MobileMenuContext) rather than a second menu. */
export default function MobileTabBar() {
  const pathname = usePathname();
  const { open: moreOpen, toggle: toggleMore } = useMobileMenu();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 flex items-stretch"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Primary"
    >
      {TABS.map(({ label, href, icon: Icon, match }) => {
        const active = !moreOpen && match(pathname);
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold",
              active ? "text-brand-600" : "text-gray-400"
            )}
          >
            <Icon className="w-5 h-5 shrink-0" strokeWidth={active ? 2.4 : 2} />
            <span className="truncate max-w-full">{label}</span>
          </Link>
        );
      })}
      <button
        type="button"
        onClick={toggleMore}
        aria-label={moreOpen ? "Close menu" : "Open menu"}
        aria-expanded={moreOpen}
        className={clsx(
          "flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold",
          moreOpen ? "text-brand-600" : "text-gray-400"
        )}
      >
        {moreOpen ? <X className="w-5 h-5 shrink-0" strokeWidth={2.4} /> : <Menu className="w-5 h-5 shrink-0" />}
        <span className="truncate max-w-full">More</span>
      </button>
    </nav>
  );
}
