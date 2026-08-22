import Link from "next/link";
import { PenTool, Trophy, ArrowRight, Newspaper } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import SectionWrapper from "@/components/SectionWrapper";
import { getHeadlinePrefix, type ArticleCategory } from "@/lib/newsStore";
import HomePollPanel from "@/components/HomePollPanel";

/** Homepage strip below the hero: latest headlines index, today's cartoon,
 *  and the daily poll. Each headline links to its article; the cartoon
 *  links to /cartoon; the poll links to /polls. Server component (the poll
 *  panel itself is a client island so it can carry the reader's vote). */
export default async function HomeNewsAndCartoon() {
  const admin = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const [{ data: articles }, { data: cartoon }, { data: pollRow }] = await Promise.all([
    admin
      .from("articles")
      .select("id, title, tag, tag_color, date, category, digest_level")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(6),
    admin
      .from("daily_cartoons")
      .select("id, title, image_url, caption, artist_name, publish_date, is_contest, winner_name")
      .eq("status", "published")
      .lte("publish_date", today)
      .order("publish_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from("polls")
      .select("id")
      .eq("status", "published")
      .lte("publish_date", today)
      .order("publish_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const headlines = articles ?? [];
  const hasPoll = Boolean(pollRow);
  if (headlines.length === 0 && !cartoon && !hasPoll) return null;

  const isToday = cartoon?.publish_date === today;
  const openContest = cartoon?.is_contest && !cartoon?.winner_name;

  const panelCount = [headlines.length > 0, Boolean(cartoon), hasPoll].filter(Boolean).length;

  return (
    <section className="bg-white border-b border-gray-100">
      <SectionWrapper tight>
        <div
          className={`grid gap-5 ${
            panelCount === 3 ? "lg:grid-cols-3" : panelCount === 2 ? "lg:grid-cols-2" : ""
          }`}
        >
          {/* ── Latest headlines index ── */}
          {headlines.length > 0 && (
            <div className="card p-5 sm:p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-brand-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Newspaper className="w-3.5 h-3.5" /> Latest News
                </p>
                <Link
                  href="/news"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-800 inline-flex items-center gap-1 transition-colors"
                >
                  All news <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <ol className="space-y-3 flex-1">
                {headlines.map((a, i) => {
                  const prefix = getHeadlinePrefix(a.category as ArticleCategory, a.digest_level);
                  return (
                    <li key={a.id}>
                      <Link href={`/news/${a.id}`} className="group flex items-start gap-3">
                        <span className="shrink-0 w-5 text-sm font-extrabold text-gray-300 group-hover:text-brand-400 transition-colors">
                          {i + 1}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm text-gray-800 leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
                            {prefix && <span className="font-extrabold">{prefix}: </span>}
                            <span className="font-semibold">{a.title}</span>
                          </span>
                          <span className="block text-[11px] text-gray-400 mt-0.5">
                            {a.tag} · {a.date}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {/* ── Daily cartoon ── */}
          {cartoon && (
            <Link
              href="/cartoon"
              className="card overflow-hidden flex flex-col hover:shadow-md transition-shadow group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cartoon.image_url}
                alt={cartoon.title}
                className="w-full h-56 object-cover object-top bg-white"
              />
              <div className="p-5 sm:p-6 flex flex-col flex-1 min-w-0">
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
                <p className="text-xs text-gray-400 mt-auto pt-3 flex items-center gap-1">
                  ✏️ {cartoon.artist_name}
                  <span className="ml-auto inline-flex items-center gap-1 font-semibold text-brand-600">
                    View &amp; archive <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </p>
              </div>
            </Link>
          )}

          {/* ── Daily poll ── */}
          {hasPoll && <HomePollPanel />}
        </div>
      </SectionWrapper>
    </section>
  );
}
