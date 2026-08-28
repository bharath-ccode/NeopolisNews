import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { resolveBusinessAuth } from "@/lib/myBusinessAuth";

/** GET ?businessId= — showtimes for one movie (owner-only). */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required." }, { status: 400 });

  const auth = await resolveBusinessAuth(req, businessId);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("show_times")
    .select("*")
    .eq("movie_id", params.id)
    .order("time", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

/** POST { businessId, time, bms_url? } — add a showtime to a movie. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const { businessId, time, bms_url } = body ?? {};

  if (!businessId || !time)
    return NextResponse.json({ error: "businessId and time are required." }, { status: 400 });

  const auth = await resolveBusinessAuth(req, businessId);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();
  const { data: movie } = await admin
    .from("now_showing")
    .select("id")
    .eq("id", params.id)
    .eq("business_id", businessId)
    .maybeSingle();
  if (!movie) return NextResponse.json({ error: "Movie not found." }, { status: 404 });

  const { data, error } = await admin
    .from("show_times")
    .insert({ movie_id: params.id, time, bms_url: bms_url || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
