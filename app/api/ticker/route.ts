import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Lightweight payload for the sitewide news ticker:
 *  the 3 latest published headlines + today's cartoon (if any). */
export async function GET() {
  const admin = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const [{ data: articles }, { data: cartoon }] = await Promise.all([
    admin
      .from("articles")
      .select("id, title")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(3),
    admin
      .from("daily_cartoons")
      .select("id, title, is_contest, winner_name, publish_date")
      .eq("status", "published")
      .lte("publish_date", today)
      .order("publish_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const items: { text: string; url: string }[] = (articles ?? []).map((a) => ({
    text: a.title,
    url: `/news/${a.id}`,
  }));

  if (cartoon) {
    const isToday = cartoon.publish_date === today;
    const openContest = cartoon.is_contest && !cartoon.winner_name;
    items.push({
      text: openContest
        ? `🖊️ Caption contest open: "${cartoon.title}" — best caption wins 25 points`
        : `🖊️ ${isToday ? "Today's cartoon" : "Latest cartoon"}: ${cartoon.title}`,
      url: "/cartoon",
    });
  }

  return NextResponse.json({ items });
}
