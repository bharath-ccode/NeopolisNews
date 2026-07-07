import Link from "next/link";
import { PenTool, Trophy, ArrowRight } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import SectionWrapper from "@/components/SectionWrapper";

/** Homepage slot: today's (or latest) published cartoon. Renders nothing
 *  until the first cartoon exists. Server component. */
export default async function DailyCartoonPanel() {
  const admin = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: cartoon } = await admin
    .from("daily_cartoons")
    .select("id, title, image_url, caption, artist_name, publish_date, is_contest, winner_name")
    .eq("status", "published")
    .lte("publish_date", today)
    .order("publish_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!cartoon) return null;

  const isToday = cartoon.publish_date === today;
  const openContest = cartoon.is_contest && !cartoon.winner_name;

  return (
    <section className="bg-white border-b border-gray-100">
      <SectionWrapper tight>
        <Link
          href="/cartoon"
          className="card overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cartoon.image_url}
            alt={cartoon.title}
            className="sm:w-72 h-48 sm:h-auto w-full object-cover bg-white shrink-0"
          />
          <div className="p-5 sm:p-6 flex flex-col justify-center min-w-0">
            <p className="text-xs font-bold text-brand-600 uppercase tracking-wider flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5" />
              {isToday ? "Today in Neopolis" : "Latest cartoon"}
            </p>
            <h2 className="font-extrabold text-gray-900 text-lg mt-1.5 group-hover:text-brand-700 transition-colors">
              {cartoon.title}
            </h2>
            {cartoon.caption ? (
              <p className="text-gray-500 italic text-sm mt-1 line-clamp-2">
                &ldquo;{cartoon.caption}&rdquo;
              </p>
            ) : openContest ? (
              <p className="text-amber-700 text-sm mt-1 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> Caption contest open — win 25 points
              </p>
            ) : null}
            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
              ✏️ {cartoon.artist_name}
              <span className="ml-auto inline-flex items-center gap-1 font-semibold text-brand-600">
                View & archive <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </p>
          </div>
        </Link>
      </SectionWrapper>
    </section>
  );
}
