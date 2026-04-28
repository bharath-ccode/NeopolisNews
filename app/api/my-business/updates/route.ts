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
    .from("business_updates")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { businessId, type, title, body: text, image_url, cta_label, cta_url } = body ?? {};

  if (!businessId || !type || !title || !text) {
    return NextResponse.json({ error: "businessId, type, title, body are required." }, { status: 400 });
  }

  const VALID_TYPES = ["opening", "new_arrival", "hiring", "notice", "community"];
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid type." }, { status: 400 });
  }

  const auth = await resolveBusinessAuth(req, businessId);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("business_updates")
    .insert({
      business_id: businessId,
      type,
      title,
      body: text,
      image_url: image_url ?? null,
      cta_label: cta_label ?? null,
      cta_url: cta_url ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
