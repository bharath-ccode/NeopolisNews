"use client";

import Link from "next/link";
import { Tag, CalendarDays, Clock, ChevronRight } from "lucide-react";

interface Offer {
  id: string;
  name: string;
  description: string | null;
  discount_percent: number | null;
  discount_label: string | null;
  end_date: string;
  image_url: string | null;
}

interface BusinessEvent {
  id: string;
  name: string;
  event_type: string;
  event_date: string;
  end_date: string | null;
  start_time: string;
  end_time: string;
  image_url: string | null;
  is_free: boolean;
  ticket_price: number | null;
}

const EVENT_TYPE_MAP: Record<string, { emoji: string; color: string; bg: string }> = {
  music_concert: { emoji: "🎵", color: "text-purple-700", bg: "bg-purple-50" },
  sports_run:    { emoji: "🏆", color: "text-orange-700", bg: "bg-orange-50" },
  food_festival: { emoji: "🍽️", color: "text-yellow-700", bg: "bg-yellow-50" },
  culture_art:   { emoji: "🎨", color: "text-rose-700",   bg: "bg-rose-50"   },
  exhibition:    { emoji: "📦", color: "text-teal-700",   bg: "bg-teal-50"   },
};

function formatDateShort(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function Carousel({ title, icon, count, children }: {
  title: string;
  icon: React.ReactNode;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="font-bold text-gray-900 text-base">{title}</h2>
        <span className="ml-1 text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{count}</span>
      </div>
      {/* Scroll container — hide scrollbar visually but keep it functional */}
      <div
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 -mx-6 px-6 md:-mx-0 md:px-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>
    </div>
  );
}

export default function BusinessCarousels({
  offers,
  events,
  businessId,
}: {
  offers: Offer[];
  events: BusinessEvent[];
  businessId: string;
}) {
  if (offers.length === 0 && events.length === 0) return null;

  return (
    <div className="card p-6 space-y-6">

      {/* ── Offers carousel ── */}
      {offers.length > 0 && (
        <Carousel
          title="Current Deals"
          icon={<Tag className="w-4 h-4 text-orange-500" />}
          count={offers.length}
        >
          {offers.map((offer) => {
            const badge = offer.discount_percent
              ? `${offer.discount_percent}% OFF`
              : offer.discount_label ?? "Special Offer";
            return (
              <div
                key={offer.id}
                className="snap-start shrink-0 w-56 rounded-2xl border border-orange-100 bg-orange-50 overflow-hidden flex flex-col"
              >
                {offer.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={offer.image_url}
                    alt={offer.name}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-20 bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center">
                    <span className="text-white text-xl font-extrabold">{badge}</span>
                  </div>
                )}
                <div className="p-3 flex-1 flex flex-col gap-1">
                  <span className="self-start bg-orange-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {badge}
                  </span>
                  <p className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{offer.name}</p>
                  {offer.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">{offer.description}</p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-auto pt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Until {formatDateShort(offer.end_date)}
                  </p>
                </div>
              </div>
            );
          })}
        </Carousel>
      )}

      {/* ── Events carousel ── */}
      {events.length > 0 && (
        <Carousel
          title="Upcoming Events"
          icon={<CalendarDays className="w-4 h-4 text-violet-500" />}
          count={events.length}
        >
          {events.map((ev) => {
            const cat = EVENT_TYPE_MAP[ev.event_type] ?? EVENT_TYPE_MAP["exhibition"];
            const isMultiDay = ev.end_date && ev.end_date !== ev.event_date;
            return (
              <Link
                key={ev.id}
                href={`/events/${ev.id}`}
                className="snap-start shrink-0 w-56 rounded-2xl border border-gray-100 bg-white overflow-hidden flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              >
                {ev.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ev.image_url}
                    alt={ev.name}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className={`w-full h-20 ${cat.bg} flex items-center justify-center`}>
                    <span className="text-3xl">{cat.emoji}</span>
                  </div>
                )}
                <div className="p-3 flex-1 flex flex-col gap-1">
                  <span className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.bg} ${cat.color}`}>
                    {cat.emoji} {ev.event_type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                  <p className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{ev.name}</p>
                  <div className="mt-auto pt-1 space-y-0.5">
                    <p className="text-[11px] text-gray-500 flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {isMultiDay
                        ? `${formatDateShort(ev.event_date)} – ${formatDateShort(ev.end_date!)}`
                        : formatDateShort(ev.event_date)}
                    </p>
                    <p className="text-[11px] text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {ev.start_time.slice(0, 5)} – {ev.end_time.slice(0, 5)}
                    </p>
                    <p className={`text-[11px] font-bold ${ev.is_free ? "text-green-600" : "text-violet-600"}`}>
                      {ev.is_free ? "Free entry" : `₹${ev.ticket_price?.toLocaleString("en-IN")}`}
                    </p>
                  </div>
                </div>
                <div className="px-3 pb-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-600 group-hover:text-violet-700">
                    View details <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </Carousel>
      )}
    </div>
  );
}
