import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getTodayIST } from "@/lib/dateIST";

export const dynamic = "force-dynamic";

const FIELDS =
  "id, title, image_url, caption, artist_name, publish_date, is_contest, winner_name, winner_caption, view_count, whatsapp_share_count";

/** GET — latest published cartoon plus a paged archive.
 *  ?page=1 (12 per page) for the archive grid. */
export async function GET(req: NextRequest) {
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1"));
  const perPage = 12;
  const today = getTodayIST();

  const admin = createAdminClient();

  const [latestRes, archiveRes] = await Promise.all([
    admin
      .from("daily_cartoons")
      .select(FIELDS)
      .eq("status", "published")
      .lte("publish_date", today)
      .order("publish_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from("daily_cartoons")
      .select(FIELDS)
      .eq("status", "published")
      .lte("publish_date", today)
      .order("publish_date", { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1),
  ]);

  return NextResponse.json({
    latest: latestRes.data ?? null,
    archive: archiveRes.data ?? [],
  });
}
