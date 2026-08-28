import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface ShowTimeRow {
  id: string;
  time: string;
  bms_url: string | null;
}

interface MovieRow {
  id: string;
  title: string;
  poster_url: string | null;
  genres: string[];
  languages: string[];
  formats: string[];
  bms_url: string | null;
  running_from: string;
  running_until: string | null;
  show_times: ShowTimeRow[];
}

interface CinemaRow {
  id: string;
  name: string;
  address: string | null;
  logo: string | null;
  subtypes: string[];
  bms_code: string | null;
  bms_slug: string | null;
  now_showing: MovieRow[];
}

/** GET ?date=YYYY-MM-DD (default today) — cinemas with the movies actually
 *  running on that date embedded, each with its showtimes. */
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("businesses")
    .select(`
      id, name, address, logo, subtypes, bms_code, bms_slug,
      now_showing (
        id, title, poster_url, genres, languages, formats, bms_url, running_from, running_until,
        show_times ( id, time, bms_url )
      )
    `)
    .eq("status", "active")
    .eq("industry", "Entertainment")
    .contains("types", ["Cinema"])
    .order("name", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const cinemas = ((data ?? []) as unknown as CinemaRow[]).map((c) => ({
    ...c,
    now_showing: (c.now_showing ?? [])
      .filter((m) => m.running_from <= date && (!m.running_until || m.running_until >= date))
      .map((m) => ({
        ...m,
        show_times: [...(m.show_times ?? [])].sort((a, b) => a.time.localeCompare(b.time)),
      })),
  }));

  return NextResponse.json(cinemas);
}
