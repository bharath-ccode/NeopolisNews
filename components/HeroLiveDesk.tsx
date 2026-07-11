import Link from "next/link";
import { PenTool, ArrowRight, Newspaper, Trophy } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";

/** Hero right column: today's live content — latest headlines + the daily
 *  cartoon — styled as a dark glass panel. Server component. */
export default async function HeroLiveDesk() {
  const admin = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const [{ data: articles }, { data: cartoon }] = await Promise.all([
    admin
      .from("articles")
      .select("id, title, tag, date")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(5),
    admin
      .from("daily_cartoons")
      .select("id, title, image_url, caption, is_contest, winner_name, publish_date")
      .eq("status", "published")
      .lte("publish_date", today)
      .order("publish_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const headlines = articles ?? [];
  if (headlines.length === 0 && !cartoon) return null;

  const openContest = cartoon?.is_contest && !cartoon?.winner_name;

  return (
    <div className="bg-black/30 backdrop-blur rounded-2xl border border-white/10 p-5 sm:p-6">
      {/* Headlines */}
      {headlines.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Newspaper className="w-3.5 h-3.5" /> Latest News
            </p>
            <Link
              href="/news"
              className="text-xs font-semibold text-brand-300 hover:text-white inline-flex items-center gap-1 transition-colors"
            >
              All news <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ol className="space-y-2.5">
            {headlines.map((a, i) => (
              <li key={a.id}>
                <Link href={`/news/${a.id}`} className="group flex items-start gap-2.5">
                  <span className="shrink-0 w-4 text-xs font-extrabold text-white/25 group-hover:text-amber-400 transition-colors leading-5">
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white/90 leading-snug line-clamp-2 group-hover:text-amber-300 transition-colors">
                      {a.title}
                    </span>
                    <span className="block text-[11px] text-white/40 mt-0.5">
                      {a.tag} · {a.date}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </>
      )}

      {/* Cartoon */}
      {cartoon && (
        <Link
          href="/cartoon"
          className={`group flex items-center gap-3 ${headlines.length > 0 ? "mt-5 pt-4 border-t border-white/10" : ""}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cartoon.image_url}
            alt={cartoon.title}
            className="w-20 h-16 rounded-lg object-cover bg-white shrink-0"
          />
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <PenTool className="w-3 h-3" /> Today in Neopolis
            </span>
            <span className="block text-sm font-semibold text-white/90 leading-snug mt-0.5 line-clamp-1 group-hover:text-amber-300 transition-colors">
              {cartoon.title}
            </span>
            {openContest ? (
              <span className="text-[11px] text-amber-300/90 flex items-center gap-1 mt-0.5">
                <Trophy className="w-3 h-3" /> Caption contest open — win 25 pts
              </span>
            ) : cartoon.caption ? (
              <span className="block text-[11px] text-white/40 italic mt-0.5 line-clamp-1">
                &ldquo;{cartoon.caption}&rdquo;
              </span>
            ) : null}
          </span>
          <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-amber-400 shrink-0 transition-colors" />
        </Link>
      )}
    </div>
  );
}
