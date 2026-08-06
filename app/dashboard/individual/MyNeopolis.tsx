"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart, Store, Phone, CalendarCheck, CalendarDays, Tag, HardHat,
  ArrowRight, Loader2, Building2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authHeaders } from "@/lib/authToken";

interface BusinessDetail {
  id: string; name: string; industry: string | null; types: string[] | null;
  address: string | null; logo: string | null; contact_phone: string | null;
}
interface BuilderDetail { id: string; builder_name: string; logo_url: string | null }
interface EventDetail {
  id: string; name: string; event_date: string; start_time: string | null;
  businesses: { name: string } | null;
}
interface DealDetail {
  id: string; name: string; discount_label: string | null; discount_percent: number | null;
  end_date: string; business_id: string; businesses: { name: string } | null;
}
interface SavedItem {
  id: string;
  item_type: "project" | "classified" | "business" | "builder" | "event" | "deal";
  item_id: string;
  detail: Record<string, unknown> | null;
}

/**
 * "My Neopolis" — the user's favourites at a glance on the dashboard home:
 * favourite places with one-tap book/call, followed builders, the next
 * saved events and active deals.
 */
export default function MyNeopolis() {
  const { user } = useAuth();
  const [items, setItems] = useState<SavedItem[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    authHeaders()
      .then((headers) => fetch("/api/saved-properties?expand=1", { headers }))
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setItems(data);
      })
      .catch(() => { if (!cancelled) setItems([]); });
    return () => { cancelled = true; };
  }, [user]);

  if (items === null) {
    return (
      <div className="card p-6 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
      </div>
    );
  }

  const places   = items.filter((i) => i.item_type === "business" && i.detail).slice(0, 4);
  const builders = items.filter((i) => i.item_type === "builder" && i.detail).slice(0, 3);
  const projects = items.filter((i) => i.item_type === "project");
  const events   = items
    .filter((i) => i.item_type === "event" && i.detail)
    .filter((i) => new Date((i.detail as unknown as EventDetail).event_date + "T23:59:59") >= new Date())
    .sort((a, b) =>
      String((a.detail as unknown as EventDetail).event_date)
        .localeCompare(String((b.detail as unknown as EventDetail).event_date)))
    .slice(0, 2);
  const deals = items
    .filter((i) => i.item_type === "deal" && i.detail)
    .filter((i) => new Date((i.detail as unknown as DealDetail).end_date + "T23:59:59") >= new Date())
    .slice(0, 2);

  const empty = places.length === 0 && builders.length === 0 && events.length === 0 && deals.length === 0;

  return (
    <div className="card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-gray-900 flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-500" /> My Neopolis
        </h3>
        <Link
          href="/dashboard/individual/saved"
          className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
        >
          All saved <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {empty ? (
        <div className="text-center py-6">
          <Store className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-500">
            Your neighbourhood shortcuts live here
          </p>
          <p className="text-xs text-gray-400 mt-1 mb-3 max-w-sm mx-auto">
            Tap the ♥ on your cafe, salon, cinema or clinic — then book tickets,
            appointments or a table from this screen in one tap.
          </p>
          <div className="flex justify-center gap-2">
            <Link href="/directory" className="btn-primary text-xs py-2">Browse Businesses</Link>
            <Link href="/deals" className="btn-secondary text-xs py-2">Today&apos;s Deals</Link>
          </div>
        </div>
      ) : (
        <>
          {places.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-3">
              {places.map((item) => {
                const d = item.detail as unknown as BusinessDetail;
                return (
                  <div key={item.id} className="flex items-center gap-3 border border-gray-100 rounded-xl p-3">
                    {d.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={d.logo} alt={d.name} className="w-9 h-9 rounded-lg object-contain border border-gray-100 bg-white shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                        <Store className="w-4 h-4 text-purple-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-gray-900 truncate">{d.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{d.types?.[0] ?? d.industry}</p>
                    </div>
                    {d.contact_phone && (
                      <a href={`tel:${d.contact_phone}`} title="Call"
                        className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50">
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                    <Link href={`/businesses/${d.id}`} title="Book"
                      className="shrink-0 p-1.5 rounded-lg text-brand-500 hover:text-brand-700 hover:bg-brand-50">
                      <CalendarCheck className="w-4 h-4" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {(events.length > 0 || deals.length > 0) && (
            <div className="grid sm:grid-cols-2 gap-3">
              {events.map((item) => {
                const d = item.detail as unknown as EventDetail;
                return (
                  <Link key={item.id} href={`/events/${d.id}`}
                    className="flex items-center gap-3 border border-violet-100 bg-violet-50/50 rounded-xl p-3 hover:border-violet-300 transition-colors">
                    <CalendarDays className="w-4 h-4 text-violet-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-gray-900 truncate">{d.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {new Date(d.event_date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                        {d.start_time ? ` · ${d.start_time.slice(0, 5)}` : ""}
                      </p>
                    </div>
                  </Link>
                );
              })}
              {deals.map((item) => {
                const d = item.detail as unknown as DealDetail;
                return (
                  <Link key={item.id} href={`/businesses/${d.business_id}`}
                    className="flex items-center gap-3 border border-amber-100 bg-amber-50/50 rounded-xl p-3 hover:border-amber-300 transition-colors">
                    <Tag className="w-4 h-4 text-amber-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-gray-900 truncate">{d.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {d.discount_label ?? (d.discount_percent ? `${d.discount_percent}% off` : "")}
                        {" · ends "}
                        {new Date(d.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {(builders.length > 0 || projects.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {builders.map((item) => {
                const d = item.detail as unknown as BuilderDetail;
                return (
                  <Link key={item.id} href={`/builders/${d.id}`}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-600 border border-gray-200 rounded-full px-2.5 py-1 hover:border-brand-300 hover:text-brand-700 transition-colors">
                    <HardHat className="w-3 h-3 text-orange-500" /> {d.builder_name}
                  </Link>
                );
              })}
              {projects.length > 0 && (
                <Link href="/dashboard/individual/saved"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-600 border border-gray-200 rounded-full px-2.5 py-1 hover:border-brand-300 hover:text-brand-700 transition-colors">
                  <Building2 className="w-3 h-3 text-brand-500" />
                  {projects.length} saved project{projects.length !== 1 ? "s" : ""}
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
