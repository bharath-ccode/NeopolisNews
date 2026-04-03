"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  Home,
  Newspaper,
  ShoppingBag,
  Wrench,
  Megaphone,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  User,
  Briefcase,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Zap,
  Thermometer,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";

// Kokapet, Telangana, India
const LAT = 17.4006;
const LON = 78.3398;
const TZ = "Asia%2FKolkata";

const CURRENT_URL  = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code&temperature_unit=celsius&timezone=${TZ}`;
const FORECAST_URL = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&hourly=temperature_2m,weather_code,precipitation_probability&temperature_unit=celsius&timezone=${TZ}&forecast_days=2`;
const DAILY_URL    = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,wind_speed_10m_max,uv_index_max&temperature_unit=celsius&timezone=${TZ}&forecast_days=5`;
const AQI_URL      = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${LAT}&longitude=${LON}&current=us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone&timezone=${TZ}`;

type CurrentWeather = { temp: number; label: string; Icon: React.ElementType };
type HourlySlice   = { time: string; temp: number; code: number; precip: number };
type DailySlice    = { date: string; max: number; min: number; code: number; precip: number; wind: number; uv: number };
type AQIData       = { us_aqi: number; pm2_5: number; pm10: number; nitrogen_dioxide: number; ozone: number };

function getWeatherLabel(code: number): { label: string; Icon: React.ElementType } {
  if (code === 0) return { label: "Clear", Icon: Sun };
  if (code <= 3) return { label: "Partly Cloudy", Icon: Cloud };
  if (code <= 48) return { label: "Foggy", Icon: Cloud };
  if (code <= 67) return { label: "Rainy", Icon: CloudRain };
  if (code <= 77) return { label: "Snowy", Icon: CloudSnow };
  if (code <= 82) return { label: "Showers", Icon: CloudRain };
  return { label: "Thunderstorm", Icon: Zap };
}

function getAQIInfo(aqi: number): { label: string; color: string; bg: string; advice: string } {
  if (aqi <= 50)  return { label: "Good",           color: "text-green-700",  bg: "bg-green-50",  advice: "Great for walk" };
  if (aqi <= 100) return { label: "Moderate",       color: "text-yellow-700", bg: "bg-yellow-50", advice: "Walk with care" };
  if (aqi <= 150) return { label: "Unhealthy*",     color: "text-orange-600", bg: "bg-orange-50", advice: "Limit outdoor walk" };
  if (aqi <= 200) return { label: "Unhealthy",      color: "text-red-600",    bg: "bg-red-50",    advice: "Skip the jog" };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "text-purple-700", bg: "bg-purple-50", advice: "Stay indoors today" };
  return           { label: "Hazardous",            color: "text-red-900",    bg: "bg-red-100",   advice: "Avoid all outdoors" };
}

function formatHour(iso: string): string {
  const h = new Date(iso).getHours();
  if (h === 0) return "12 AM";
  if (h < 12)  return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

function formatDay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function WeatherWidget() {
  const [current, setCurrent]   = useState<CurrentWeather | null>(null);
  const [open, setOpen]         = useState(false);
  const [tab, setTab]           = useState<"hourly" | "5day">("hourly");
  const [forecast, setForecast] = useState<HourlySlice[] | null>(null);
  const [daily, setDaily]       = useState<DailySlice[] | null>(null);
  const [aqi, setAqi]           = useState<AQIData | null>(null);
  const [extended, setExtended] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fetch current conditions on mount
  useEffect(() => {
    fetch(CURRENT_URL)
      .then((r) => r.json())
      .then((d) => {
        const temp = Math.round(d.current.temperature_2m);
        const { label, Icon } = getWeatherLabel(d.current.weather_code);
        setCurrent({ temp, label, Icon });
      })
      .catch(() => {});
  }, []);

  // Fetch hourly forecast + daily + AQI when panel opens (only once)
  useEffect(() => {
    if (!open || forecast) return;
    Promise.all([
      fetch(FORECAST_URL).then((r) => r.json()),
      fetch(DAILY_URL).then((r) => r.json()),
      fetch(AQI_URL).then((r) => r.json()),
    ]).then(([fd, dd, ad]) => {
      // Hourly slices from current hour
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const currentHour = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:00`;
      const startIdx = fd.hourly.time.findIndex((t: string) => t >= currentHour);
      const idx = startIdx === -1 ? 0 : startIdx;
      setForecast(fd.hourly.time.slice(idx, idx + 24).map((t: string, i: number) => ({
        time: t,
        temp: Math.round(fd.hourly.temperature_2m[idx + i]),
        code: fd.hourly.weather_code[idx + i],
        precip: fd.hourly.precipitation_probability[idx + i],
      })));
      // Daily slices
      setDaily(dd.daily.time.map((t: string, i: number) => ({
        date:   t,
        max:    Math.round(dd.daily.temperature_2m_max[i]),
        min:    Math.round(dd.daily.temperature_2m_min[i]),
        code:   dd.daily.weather_code[i],
        precip: dd.daily.precipitation_probability_max[i],
        wind:   Math.round(dd.daily.wind_speed_10m_max[i]),
        uv:     Math.round(dd.daily.uv_index_max[i]),
      })));
      setAqi(ad.current);
    }).catch(() => {});
  }, [open, forecast]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const visibleForecast = forecast ? forecast.slice(0, extended ? 24 : 12) : [];

  return (
    <div className="relative hidden lg:block" ref={ref}>
      {/* Pill button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
      >
        {current ? (
          <>
            <current.Icon className="w-4 h-4 text-brand-500" />
            <span className="font-medium text-gray-700">{current.temp}°C</span>
            <span className="text-gray-400">{current.label}</span>
          </>
        ) : (
          <>
            <Thermometer className="w-4 h-4 text-gray-400 animate-pulse" />
            <span className="text-gray-400">Kokapet</span>
          </>
        )}
        <ChevronDown className={clsx("w-3 h-3 text-gray-400 transition-transform", open && "rotate-180")} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-100 shadow-xl z-50 overflow-hidden">

          {/* Current conditions header */}
          <div className="px-4 py-3 bg-brand-50 border-b border-brand-100">
            <p className="text-xs text-brand-500 font-medium">Kokapet, Telangana</p>
            {current ? (
              <div className="flex items-center gap-2 mt-1">
                <current.Icon className="w-6 h-6 text-brand-600" />
                <span className="text-2xl font-bold text-brand-900">{current.temp}°C</span>
                <span className="text-sm text-brand-600">{current.label}</span>
              </div>
            ) : (
              <p className="text-sm text-brand-400 mt-1">Loading…</p>
            )}
          </div>

          {/* Air quality — shown immediately on open */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Air Quality</p>
            {!aqi ? (
              <div className="flex justify-center py-3">
                <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (() => {
              const info = getAQIInfo(aqi.us_aqi);
              return (
                <>
                  <div className={clsx("flex items-center justify-between rounded-lg px-3 py-2 mb-2", info.bg)}>
                    <div>
                      <span className="text-sm text-gray-600 font-medium">Air Quality Index</span>
                      <p className="text-xs text-gray-500 mt-0.5 italic">{info.advice}</p>
                    </div>
                    <span className={clsx("text-sm font-bold", info.color)}>{aqi.us_aqi} · {info.label}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: "PM2.5", value: aqi.pm2_5 },
                      { label: "PM10",  value: aqi.pm10 },
                      { label: "NO₂",   value: aqi.nitrogen_dioxide },
                      { label: "O₃",    value: aqi.ozone },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 rounded-lg px-2 py-1.5 text-center">
                        <p className="text-xs text-gray-400">{label}</p>
                        <p className="text-xs font-semibold text-gray-700">{value != null ? value.toFixed(1) : "—"}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-300 mt-1.5 text-right">*Sensitive groups</p>
                </>
              );
            })()}
          </div>

          {/* Tab bar */}
          <div className="flex border-b border-gray-100">
            {(["hourly", "5day"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={clsx(
                  "flex-1 py-2 text-xs font-semibold transition-colors",
                  tab === t
                    ? "text-brand-600 border-b-2 border-brand-600 -mb-px bg-white"
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                {t === "hourly" ? "Hourly" : "5 Days"}
              </button>
            ))}
          </div>

          {/* Hourly forecast */}
          {tab === "hourly" && (
            <div className="px-4 py-3">
              {!forecast ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    {visibleForecast.map((h) => {
                      const { Icon } = getWeatherLabel(h.code);
                      return (
                        <div key={h.time} className="flex items-center gap-2 text-sm py-0.5">
                          <span className="text-gray-400 text-xs w-12 shrink-0">{formatHour(h.time)}</span>
                          <Icon className="w-4 h-4 text-brand-400 shrink-0" />
                          <span className="font-medium text-gray-700 w-12">{h.temp}°C</span>
                          <div className="flex-1 flex items-center gap-1">
                            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-1 bg-blue-400 rounded-full" style={{ width: `${h.precip}%` }} />
                            </div>
                            <span className="text-xs text-blue-400 w-8 text-right">{h.precip}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {!extended && (
                    <button
                      onClick={() => setExtended(true)}
                      className="mt-2 w-full text-xs text-brand-600 hover:text-brand-800 py-1.5 border border-brand-100 rounded-lg hover:bg-brand-50 transition-colors"
                    >
                      Show next 12 more hours
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* 5-day forecast */}
          {tab === "5day" && (
            <div className="px-4 py-3">
              {!daily ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-1">
                  {daily.map((d) => {
                    const { Icon, label } = getWeatherLabel(d.code);
                    return (
                      <div key={d.date} className="rounded-lg hover:bg-gray-50 px-2 py-2 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700 w-20 shrink-0">{formatDay(d.date)}</span>
                          <Icon className="w-4 h-4 text-brand-400 shrink-0" />
                          <span className="text-xs text-gray-500 flex-1 truncate">{label}</span>
                          <span className="text-sm font-bold text-gray-800">{d.max}°</span>
                          <span className="text-sm text-gray-400">{d.min}°</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 ml-22 pl-[88px] text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <CloudRain className="w-3 h-3 text-blue-400" />{d.precip}%
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-yellow-400" />UV {d.uv}
                          </span>
                          <span>{d.wind} km/h wind</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}

const NAV_ITEMS = [
  {
    label: "Real Estate",
    href: "/real-estate",
    icon: Building2,
    sub: [
      { label: "Project Pages", href: "/real-estate#projects" },
      { label: "Price Trends", href: "/real-estate#prices" },
      { label: "Construction Updates", href: "/real-estate#construction" },
      { label: "Floor Plans", href: "/real-estate#floorplans" },
    ],
  },
  {
    label: "Rentals & Resale",
    href: "/rentals",
    icon: Home,
    sub: [
      { label: "Residential Rentals", href: "/rentals#residential" },
      { label: "Office Leasing", href: "/rentals#office" },
      { label: "Retail Shops", href: "/rentals#retail" },
      { label: "Resale Listings", href: "/rentals#resale" },
    ],
  },
  {
    label: "Directory",
    href: "/directory",
    icon: ShoppingBag,
    sub: [
      { label: "Mall & Retail", href: "/directory#mall" },
      { label: "Restaurants & Cafes", href: "/directory#food" },
      { label: "Entertainment", href: "/directory#entertainment" },
      { label: "Fitness & Wellness", href: "/directory#fitness" },
    ],
  },
  {
    label: "News",
    href: "/news",
    icon: Newspaper,
    sub: [
      { label: "Construction Updates", href: "/news#construction" },
      { label: "New Launches", href: "/news#launches" },
      { label: "Infrastructure", href: "/news#infrastructure" },
      { label: "Community", href: "/news#community" },
    ],
  },
  {
    label: "Services",
    href: "/services",
    icon: Wrench,
    sub: [
      { label: "Move-In Concierge", href: "/services#concierge" },
      { label: "Interiors & Fit-Out", href: "/services#interiors" },
      { label: "Facility Management", href: "/services#facility" },
      { label: "Utilities Setup", href: "/services#utilities" },
    ],
  },
  {
    label: "Advertise",
    href: "/advertise",
    icon: Megaphone,
    highlight: true,
  },
];

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
        <Link href="/auth/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
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
  const displayName = user.userType === "business" ? user.businessName ?? user.name : user.name;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-semibold text-gray-700 max-w-[100px] truncate">
          {displayName.split(" ")[0]}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-gray-100 shadow-lg py-1 z-50">
          <div className="px-4 py-2.5 border-b border-gray-50">
            <p className="text-xs font-semibold text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-400 truncate">{user.email ?? user.phone}</p>
            <span className={`badge mt-1 ${user.userType === "individual" ? "tag-blue" : "tag-purple"}`}>
              {user.userType === "individual" ? (
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
            {user.userType === "individual" ? <Home className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
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

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Top bar */}
      <div className="bg-brand-950 text-brand-200 text-xs py-1.5 px-4 text-center hidden md:block">
        Neopolis — 100-acre mixed-use urban district &nbsp;·&nbsp; Live updates
        every week &nbsp;·&nbsp;
        <Link href="/advertise" className="underline hover:text-white">
          List your property or business →
        </Link>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 leading-none">
              Neopolis<span className="text-brand-600">News</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.href)}
                  onMouseLeave={() => setActiveDropdown(null)}
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
                    {item.sub && (
                      <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                    )}
                  </Link>

                  {item.sub && activeDropdown === item.href && (
                    <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl border border-gray-100 shadow-lg py-1 z-50">
                      {item.sub.map((s) => (
                        <Link
                          key={s.href}
                          href={s.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700"
                        >
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Auth + Mobile toggle */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex">
              <UserMenu />
            </div>
            <WeatherWidget />
            <button
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

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
