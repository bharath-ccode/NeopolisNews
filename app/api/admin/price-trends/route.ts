import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const SEGMENTS = ["residential", "office", "retail"] as const;

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("price_trends")
    .select("id, period, period_date, segment, price, note")
    .order("period_date", { ascending: false })
    .order("segment");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

/** POST { period, period_date, segment, price, note? } — upsert one data point. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { period, period_date, segment, price, note } = body ?? {};

  if (!period?.trim())   return NextResponse.json({ error: "period required (e.g. Q1 2026)" }, { status: 400 });
  if (!period_date)      return NextResponse.json({ error: "period_date required" }, { status: 400 });
  if (!SEGMENTS.includes(segment))
    return NextResponse.json({ error: "segment must be residential, office or retail" }, { status: 400 });
  const value = Number(price);
  if (!value || value <= 0)
    return NextResponse.json({ error: "price must be a positive number" }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("price_trends")
    .upsert(
      { period: period.trim(), period_date, segment, price: value, note: note?.trim() || null },
      { onConflict: "period,segment" }
    )
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}

/** DELETE ?id= */
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from("price_trends").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
