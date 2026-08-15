import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { createAdminClient } from "@/lib/supabase/server";

const SOURCES = ["cinemas_page", "now_showing"] as const;

/** POST — fire-and-forget log of a "book tickets" click-through to
 *  BookMyShow. Public, anonymous, rate-limited generously since it fires
 *  on ordinary browsing clicks rather than a form submission. */
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "ticket-clicks", { limit: 30 });
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const { businessId, businessName, movieId, movieTitle, showDate, showTime, bmsUrl, source } = body ?? {};

  if (!bmsUrl || typeof bmsUrl !== "string") {
    return NextResponse.json({ error: "bmsUrl is required." }, { status: 400 });
  }
  if (!SOURCES.includes(source)) {
    return NextResponse.json({ error: "Invalid source." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("ticket_click_events").insert({
    business_id: businessId || null,
    business_name: businessName || null,
    movie_id: movieId || null,
    movie_title: movieTitle || null,
    show_date: showDate || null,
    show_time: showTime || null,
    bms_url: bmsUrl,
    source,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
