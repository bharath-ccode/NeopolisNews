import Link from "next/link";
import { CalendarDays, MapPin, ArrowRight, PartyPopper } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import SectionWrapper from "@/components/SectionWrapper";
import { getTodayIST } from "@/lib/dateIST";

interface UpcomingEvent {
  id: string;
  name: string;
  event_date: string;
  image_url: string | null;
  businesses: { name: string } | null;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

/** Homepage strip under the daily poll — the next few upcoming events
 *  across every business, same data /events itself reads. Renders nothing
 *  when there's nothing upcoming, same pattern as HomeNewsAndCartoon. */
export default async function HomeFeaturedEvents() {
  const admin = createAdminClient();
  const today = getTodayIST();

  const { data } = await admin
    .from("business_events")
    .select("id, name, event_date, image_url, businesses(name)")
    .eq("status", "active")
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(3);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const events = (data ?? []) as any as UpcomingEvent[];
  if (events.length === 0) return null;

  return (
    <section className="bg-white border-b border-gray-100">
      <SectionWrapper tight>
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-violet-600 uppercase tracking-wider flex items-center gap-1.5">
              <PartyPopper className="w-3.5 h-3.5" /> Featured Events
            </p>
            <Link
              href="/events"
              className="text-xs font-semibold text-violet-600 hover:text-violet-800 inline-flex items-center gap-1 transition-colors"
            >
              All events <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {events.map((ev) => (
              <Link
                key={ev.id}
                href={`/events/${ev.id}`}
                className="group flex items-center gap-3 sm:flex-col sm:items-start"
              >
                {ev.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ev.image_url}
                    alt={ev.name}
                    className="w-16 h-16 sm:w-full sm:h-28 object-cover rounded-xl shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-full sm:h-28 bg-violet-50 rounded-xl shrink-0 flex items-center justify-center">
                    <PartyPopper className="w-6 h-6 text-violet-200" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-violet-700 transition-colors">
                    {ev.name}
                  </p>
                  {ev.businesses?.name && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" /> {ev.businesses.name}
                    </p>
                  )}
                  <p className="text-xs text-violet-600 font-medium mt-1 flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" /> {formatDate(ev.event_date)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </SectionWrapper>
    </section>
  );
}
