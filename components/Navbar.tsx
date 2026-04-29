"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Newspaper,
  ShoppingBag,
  Wrench,
  Megaphone,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  User,
  Briefcase,
  HeartPulse,
  CalendarDays,
  Sparkles,
  Tag,
  Search,
  GraduationCap,
  Landmark,
  Bell,
  MessageSquare,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";
import WeatherWidget from "@/components/WeatherWidget";

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    label: "News",
    href: "/news",
    icon: Newspaper,
    sub: [
      { label: "Construction Updates", href: "/news#construction"  },
      { label: "New Launches",         href: "/news#launches"      },
      { label: "Infrastructure",       href: "/news#infrastructure" },
      { label: "Community",            href: "/news#community"     },
    ],
  },
  {
    label: "Real Estate",
    href: "/real-estate",
    icon: Building2,
    sub: [
      { label: "Project Pages",        href: "/real-estate#projects"     },
      { label: "Price Trends",         href: "/real-estate#prices"       },
      { label: "Construction Updates", href: "/real-estate#construction" },
      {
        label: "Resale & Rentals",
        href: "/rentals",
        icon: Home,
        children: [
          { label: "Residential Rentals", href: "/rentals#residential" },
          { label: "Office Leasing",      href: "/rentals#office"      },
          { label: "Retail Shops",        href: "/rentals#retail"      },
          { label: "Resale Listings",     href: "/rentals#resale"      },
        ],
      },
    ],
  },
  {
    label: "Health",
    href: "/health",
    icon: HeartPulse,
    sub: [
      { label: "Hospitals",          href: "/health?type=hospitals"   },
      { label: "Ambulance Services", href: "/health?type=ambulance"   },
      { label: "Clinics",            href: "/health?type=clinics"     },
      { label: "Diagnostics",        href: "/health?type=diagnostics" },
      { label: "Pharmacies",         href: "/health?type=pharmacies"  },
      {
        label: "Wellness",
        href: "/health/wellness",
        icon: Sparkles,
        children: [
          { label: "Massage Spa",             href: "/health/wellness?type=spa"     },
          { label: "Gym",                     href: "/health/wellness?type=gym"     },
          { label: "Yoga Studio",             href: "/health/wellness?type=studio"  },
          { label: "Dance Studio",            href: "/health/wellness?type=studio"  },
          { label: "Personal Trainers",       href: "/health/wellness?type=trainer" },
          { label: "Meditation & Mindfulness",href: "/health/wellness"              },
          { label: "Nutrition & Diet",        href: "/health/wellness"              },
        ],
      },
    ],
  },
  {
    label: "Education",
    href: "/education",
    icon: GraduationCap,
    sub: [
      { label: "Schools",           href: "/education?type=schools"  },
      { label: "Day Care",          href: "/education?type=daycare"  },
      { label: "Coaching & Tuition",href: "/education?type=coaching" },
    ],
  },
  {
    label: "Events",
    href: "/events",
    icon: CalendarDays,
    sub: [
      {
        label: "Event Spaces",
        href: "/events/spaces",
        icon: Landmark,
        children: [
          { label: "Convention Centres", href: "/events/spaces?sub=Convention+Centre" },
          { label: "Banquet Halls",      href: "/events/spaces?sub=Banquet+Hall"      },
          { label: "Outdoor Spaces",     href: "/events/spaces?sub=Outdoor+Space"     },
        ],
      },
      { label: "Upcoming Events", href: "/events" },
    ],
  },
  {
    label: "Services",
    href: "/services",
    icon: Wrench,
    sub: [
      { label: "Moving",   href: "/services/local?type=moving"   },
      { label: "Party",    href: "/services/local?type=party"    },
      { label: "Home",     href: "/services/local?type=home"     },
      { label: "Delivery", href: "/services/local?type=delivery" },
      { label: "Driving",  href: "/services/local?type=driving"  },
    ],
  },
  {
    label: "Deals",
    href: "/deals",
    icon: ShoppingBag,
  },
  {
    label: "Classifieds",
    href: "/classifieds",
    icon: Tag,
    sub: [
      { label: "All Ads",          href: "/classifieds"                              },
      { label: "Cars & Vehicles",  href: "/classifieds?cat=cars"                     },
      { label: "Bikes & Scooters", href: "/classifieds?cat=bikes"                    },
      { label: "Furniture",        href: "/classifieds?cat=furniture"                },
      { label: "Electronics",      href: "/classifieds?cat=electronics"              },
      { label: "Post a Free Ad",   href: "/dashboard/individual/classifieds"         },
    ],
  },
  {
    label: "Advertise",
    href: "/advertise",
    icon: Megaphone,
    highlight: true,
  },
];

// ─── User menu ────────────────────────────────────────────────────────────────

function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/auth/login"
          className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          Sign in
        </Link>
        <Link href="/auth/register" className="btn-primary text-sm py-2">
          Register
        </Link>
      </div>
    );
  }

  const dashboardHref =
    user.userType === "individual" ? "/dashboard/individual" : "/dashboard/business";

  const isIndividual  = user.userType === "individual";
  const screenName    = isIndividual ? user.screen_name : undefined;
  const displayName   = isIndividual
    ? (user.businessName ?? user.name)  // won't hit — kept for type safety
    : (user.businessName ?? user.name);
  // What shows in the nav button
  const buttonLabel   = isIndividual
    ? (screenName ? `@${screenName}` : user.name.split(" ")[0])
    : (user.businessName ?? user.name).split(" ")[0];
  // Avatar initial
  const avatarChar    = (screenName ?? displayName).charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
          {avatarChar}
        </div>
        <span className="text-sm font-semibold text-gray-700 max-w-[120px] truncate">
          {buttonLabel}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-100 shadow-lg py-1 z-50">
          <div className="px-4 py-2.5 border-b border-gray-50">
            {isIndividual && screenName ? (
              <>
                <p className="text-sm font-bold text-brand-700 truncate">@{screenName}</p>
                <p className="text-xs text-gray-500 truncate">{user.name}</p>
              </>
            ) : (
              <p className="text-xs font-semibold text-gray-900 truncate">{displayName}</p>
            )}
            <p className="text-xs text-gray-400 truncate mt-0.5">{user.email ?? user.phone}</p>
            <span className={`badge mt-1 ${isIndividual ? "tag-blue" : "tag-purple"}`}>
              {isIndividual ? (
                <><User className="w-3 h-3" /> Individual</>
              ) : (
                <><Briefcase className="w-3 h-3" /> Business</>
              )}
            </span>
          </div>
          <Link
            href={dashboardHref}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700"
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link
            href={user.userType === "individual" ? "/dashboard/individual/post" : "/dashboard/business/post"}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700"
          >
            {user.userType === "individual" ? (
              <Home className="w-4 h-4" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
            {user.userType === "individual" ? "Post Listing" : "Post Classified"}
          </Link>
          <div className="border-t border-gray-50 mt-1" />
          <button
            onClick={() => { logout(); router.push("/"); setOpen(false); }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 w-full"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setSearchOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [searchOpen]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim().length < 2) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSearchQuery("");
  }

  function handleMouseEnter(href: string) {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setActiveDropdown(href);
  }

  function handleMouseLeave() {
    leaveTimer.current = setTimeout(() => setActiveDropdown(null), 150);
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Top bar */}
      <div className="bg-brand-950 text-brand-200 text-xs py-1.5 px-4 flex items-center justify-between gap-4">
        <span className="hidden md:block text-center flex-1">
          Neopolis — 100-acre mixed-use urban district &nbsp;·&nbsp; Live updates
          every week &nbsp;·&nbsp;
          <Link href="/advertise" className="underline hover:text-white">
            List your property or business →
          </Link>
        </span>
        <span className="md:hidden text-brand-400 text-xs shrink-0">Neopolis</span>
        <WeatherWidget />
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src="/logo.png" alt="NeopolisNews" width={36} height={36} className="object-contain" />
            <span className="text-lg font-bold text-gray-900 leading-none">
              Neopolis<span className="text-brand-600">News</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.filter((item) => !item.highlight).map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(item.href)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      item.highlight
                        ? "bg-accent-500 text-white hover:bg-accent-600"
                        : active
                        ? "bg-brand-50 text-brand-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                    {item.sub && <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
                  </Link>

                  {item.sub && activeDropdown === item.href && (
                    <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl border border-gray-100 shadow-lg py-1 z-50">
                      {item.sub.map((s) =>
                        "children" in s && s.children ? (
                          <div key={s.href} className="relative group/nested">
                            <Link
                              href={s.href}
                              className="flex items-center justify-between gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700"
                            >
                              <span className="flex items-center gap-2">
                                {"icon" in s && s.icon && <s.icon className="w-3.5 h-3.5 text-purple-500" />}
                                {s.label}
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                            </Link>
                            <div className="absolute left-full top-0 w-44 bg-white rounded-xl border border-gray-100 shadow-lg py-1 hidden group-hover/nested:block">
                              {s.children.map((c) => (
                                <Link
                                  key={c.href}
                                  href={c.href}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                                >
                                  {c.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <Link
                            key={s.href}
                            href={s.href}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700"
                          >
                            {s.label}
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Auth + Mobile toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
            <Link
              href="/announcements"
              aria-label="Announcements"
              className={clsx(
                "p-2 rounded-lg transition-colors",
                pathname.startsWith("/announcements")
                  ? "text-brand-700 bg-brand-50"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Bell className="w-4 h-4" />
            </Link>
            <Link
              href="/forum"
              aria-label="Community Forum"
              className={clsx(
                "p-2 rounded-lg transition-colors",
                pathname.startsWith("/forum")
                  ? "text-brand-700 bg-brand-50"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <MessageSquare className="w-4 h-4" />
            </Link>
            <Link
              href="/advertise"
              className="hidden lg:flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-accent-500 text-white hover:bg-accent-600 transition-colors"
            >
              <Megaphone className="w-4 h-4" />
              Advertise
            </Link>
            <div className="hidden lg:flex">
              <UserMenu />
            </div>
            <button
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Search overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[100] flex items-start justify-center pt-24 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 px-5 py-4">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search businesses, properties, news…"
                className="flex-1 text-base outline-none text-gray-900 placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
            <div className="px-5 pb-4 flex gap-2 flex-wrap">
              {["Restaurants", "Gym", "2 BHK for rent", "Cafe", "Construction"].map((hint) => (
                <button
                  key={hint}
                  type="button"
                  onClick={() => { setSearchQuery(hint); router.push(`/search?q=${encodeURIComponent(hint)}`); setSearchOpen(false); setSearchQuery(""); }}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-brand-50 hover:text-brand-700 text-gray-600 rounded-full transition-colors"
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white pb-4">
          <div className="max-w-7xl mx-auto px-4 pt-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                  item.highlight
                    ? "bg-accent-500 text-white"
                    : pathname.startsWith(item.href)
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            ))}
            {/* Icon-only items shown in full in mobile menu */}
            <Link
              href="/announcements"
              onClick={() => setMobileOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                pathname.startsWith("/announcements") ? "bg-brand-50 text-brand-700" : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <Bell className="w-4 h-4 shrink-0" /> Announcements
            </Link>
            <Link
              href="/forum"
              onClick={() => setMobileOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                pathname.startsWith("/forum") ? "bg-brand-50 text-brand-700" : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <MessageSquare className="w-4 h-4 shrink-0" /> Forum
            </Link>
            <div className="pt-3 border-t border-gray-100 mt-2">
              <div className="px-3">
                <UserMenu />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
