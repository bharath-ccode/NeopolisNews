import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { resolveBusinessAuth } from "@/lib/myBusinessAuth";

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required." }, { status: 400 });

  const auth = await resolveBusinessAuth(req, businessId);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("now_showing")
    .select("*")
    .eq("business_id", businessId)
    .order("running_from", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { businessId, title, poster_url, genres, languages, formats, bms_url, running_from, running_until } = body ?? {};

  if (!businessId || !title || !running_from)
    return NextResponse.json({ error: "businessId, title, running_from are required." }, { status: 400 });

  const auth = await resolveBusinessAuth(req, businessId);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("now_showing")
    .insert({
      business_id:   businessId,
      title,
      poster_url:    poster_url ?? null,
      genres:        genres ?? [],
      languages:     languages ?? [],
      formats:       formats ?? [],
      bms_url:       bms_url ?? null,
      running_from,
      running_until: running_until ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
