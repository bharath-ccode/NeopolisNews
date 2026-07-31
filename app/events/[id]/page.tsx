import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays, Clock, MapPin, ArrowLeft, Building2,
  Ticket, Users, CheckCircle, Music, Trophy, Utensils, Palette, Package,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import SectionWrapper from "@/components/SectionWrapper";
import ClaimButton from "./ClaimButton";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neopolis.news";

const EVENT_TYPE_MAP: Record<string, { label: string; Icon: React.ElementType; color: string; bg: string }> = {
  music_concert: { label: "Music Concert",  Icon: Music,        color: "text-purple-600", bg: "bg-purple-50"  },
  sports_run:    { label: "Sports & Run",   Icon: Trophy,       color: "text-orange-600", bg: "bg-orange-50"  },
  food_festival: { label: "Food Festival",  Icon: Utensils,     color: "text-yellow-700", bg: "bg-yellow-50"  },
  culture_art:   { label: "Culture & Art",  Icon: Palette,      color: "text-rose-600",   bg: "bg-rose-50"    },
  exhibition:    { label: "Exhibition",     Icon: Package,      color: "text-teal-600",   bg: "bg-teal-50"    },
};

interface EventRow {
  id: string;
  name: string;
  event_type: string;
  event_date: string;
  end_date: string | null;
  start_time: string;
  end_time: string;
  description: string | null;
  image_url: string | null;
  is_free: boolean;
  ticket_price: number | null;
  total_slots: number | null;
  claimed_slots: number;
  business_id: string;
  businesses: { id: string; name: string; address: string | null; logo: string | null } | null;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatDateShort(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("business_events")
    .select("name, description, event_date, businesses(name)")
    .eq("id", params.id)
    .single();
  if (!data) return { title: "Event Not Found" };
  return {
    title: `${data.name} | NeopolisNews Events`,
    description: data.description ?? `${data.name} — an event in Neopolis district.`,
    openGraph: { title: data.name, url: `${SITE_URL}/events/${params.id}`, type: "website" },
  };
}

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const admin = createAdminClient();
  const { data: ev } = await admin
    .from("business_events")
    .select("*, businesses(id, name, address, logo)")
    .eq("id", params.id)
    .single<EventRow>();

  if (!ev) notFound();

  const cat = EVENT_TYPE_MAP[ev.event_type] ?? EVENT_TYPE_MAP["exhibition"];
  const Icon = cat.Icon;

  const isMultiDay = ev.end_date && ev.end_date !== ev.event_date;
  const availableSlots = ev.total_slots != null ? ev.total_slots - ev.claimed_slots : null;
  const soldOut = availableSlots !== null && availableSlots <= 0;

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neopolis.news";
  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: ev.name,
    startDate: ev.start_time ? `${ev.event_date}T${ev.start_time}` : ev.event_date,
    ...(ev.end_date || ev.end_time
      ? { endDate: ev.end_time ? `${ev.end_date ?? ev.event_date}T${ev.end_time}` : ev.end_date }
      : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(ev.description ? { description: ev.description } : {}),
    ...(ev.image_url ? { image: [ev.image_url] } : {}),
    location: {
      "@type": "Place",
      name: ev.businesses?.name ?? "Neopolis",
      address: {
        "@type": "PostalAddress",
        streetAddress: ev.businesses?.address ?? "Neopolis, Kokapet",
        addressLocality: "Hyderabad",
        addressRegion: "Telangana",
        addressCountry: "IN",
      },
    },
    ...(ev.businesses
      ? { organizer: { "@type": "Organization", name: ev.businesses.name, url: `${SITE_URL}/businesses/${ev.businesses.id}` } }
      : {}),
    offers: {
      "@type": "Offer",
      price: ev.is_free ? 0 : ev.ticket_price ?? 0,
      priceCurrency: "INR",
      availability: soldOut ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      url: `${SITE_URL}/events/${ev.id}`,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-violet-950 via-violet-900 to-violet-800 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <Link href="/events" className="inline-flex items-center gap-1.5 text-violet-300 hover:text-white text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Events
          </Link>

          <div className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full mb-4 ${cat.bg} ${cat.color}`}>
            <Icon className="w-3.5 h-3.5" /> {cat.label}
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">{ev.name}</h1>

          {/* Date / time */}
          <div className="flex flex-wrap gap-4 text-sm text-violet-200 mb-6">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-violet-400" />
              {isMultiDay
                ? `${formatDateShort(ev.event_date)} – ${formatDateShort(ev.end_date!)}`
                : formatDate(ev.event_date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-violet-400" />
              {ev.start_time.slice(0, 5)} – {ev.end_time.slice(0, 5)}
            </span>
          </div>

          {/* Business */}
          {ev.businesses && (
            <Link href={`/businesses/${ev.businesses.id}`} className="inline-flex items-center gap-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2.5 transition-colors">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
                {ev.businesses.logo
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={ev.businesses.logo} alt={ev.businesses.name} className="w-full h-full object-cover" />
                  : <Building2 className="w-4 h-4 text-white/60" />}
              </div>
              <div>
                <p className="text-xs text-violet-300 font-medium">Organised by</p>
                <p className="text-sm font-bold text-white">{ev.businesses.name}</p>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* Event image */}
      {ev.image_url && (
        <div className="bg-violet-950">
          <div className="max-w-3xl mx-auto">
            <div className="aspect-video overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ev.image_url} alt={ev.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <SectionWrapper>
        <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-6">

          {/* Left — Description */}
          <div className="md:col-span-2 space-y-5">
            {ev.description && (
              <div className="card p-6">
                <h2 className="font-bold text-gray-900 text-base mb-3">About this Event</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{ev.description}</p>
              </div>
            )}

            {ev.businesses?.address && (
              <div className="card p-6">
                <h2 className="font-bold text-gray-900 text-base mb-3">Location</h2>
                <p className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  {ev.businesses.address}
                </p>
              </div>
            )}
          </div>

          {/* Right — Ticket / Slot info */}
          <div className="space-y-4">
            <div className="card p-5 space-y-4">
              {/* Price */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Entry</p>
                {ev.is_free ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-lg font-extrabold text-green-700">Free</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Ticket className="w-5 h-5 text-violet-500" />
                    <span className="text-lg font-extrabold text-gray-900">
                      ₹{ev.ticket_price?.toLocaleString("en-IN")}
                    </span>
                    <span className="text-sm text-gray-400">per ticket</span>
                  </div>
                )}
              </div>

              {/* Slots */}
              {ev.total_slots != null && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Availability</p>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    {soldOut ? (
                      <span className="text-sm font-bold text-red-600">Sold Out</span>
                    ) : (
                      <span className="text-sm text-gray-700">
                        <span className="font-bold text-gray-900">{availableSlots}</span> of {ev.total_slots} slots left
                      </span>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${soldOut ? "bg-red-400" : availableSlots! < ev.total_slots * 0.2 ? "bg-orange-400" : "bg-green-400"}`}
                      style={{ width: `${Math.min(100, (ev.claimed_slots / ev.total_slots) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{ev.claimed_slots} claimed</p>
                </div>
              )}

              {/* Claim button (client component) */}
              <ClaimButton eventId={ev.id} soldOut={soldOut} hasSlots={ev.total_slots != null} />
            </div>

            {/* Date reminder */}
            <div className="card p-4 space-y-2 text-sm text-gray-600">
              <p className="flex items-start gap-2">
                <CalendarDays className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                <span>
                  {isMultiDay
                    ? <><strong>{formatDateShort(ev.event_date)}</strong> to <strong>{formatDateShort(ev.end_date!)}</strong></>
                    : <strong>{formatDate(ev.event_date)}</strong>}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-500 shrink-0" />
                <span>{ev.start_time.slice(0, 5)} – {ev.end_time.slice(0, 5)}</span>
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
