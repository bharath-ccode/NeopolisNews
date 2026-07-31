import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Public digest archive.
 *  GET ?date=YYYY-MM-DD → { articles, dates }
 *  - articles: published digest articles for that date
 *  - dates: the most recent dates (up to 30) that have a published digest,
 *    so the page can render date navigation. */
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date param (YYYY-MM-DD) required" }, { status: 400 });
  }

  const sb = createAdminClient();

  const [articlesRes, datesRes] = await Promise.all([
    sb
      .from("articles")
      .select("id, title, excerpt, read_time, digest_level, digest_date")
      .eq("digest_date", date)
      .eq("status", "published")
      .order("created_at", { ascending: true }),
    sb
      .from("articles")
      .select("digest_date")
      .eq("status", "published")
      .not("digest_date", "is", null)
      .order("digest_date", { ascending: false })
      .limit(400),
  ]);

  if (articlesRes.error) {
    return NextResponse.json({ error: articlesRes.error.message }, { status: 500 });
  }

  const dates = Array.from(
    new Set((datesRes.data ?? []).map((r) => r.digest_date as string))
  ).slice(0, 30);

  return NextResponse.json({ articles: articlesRes.data ?? [], dates });
}
