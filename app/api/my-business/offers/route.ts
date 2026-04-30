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
    .from("business_offers")
    .select("*")
    .eq("business_id", businessId)
    .order("start_date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { businessId, name, description, discount_percent, discount_label, start_date, end_date, image_url } = body ?? {};

  if (!businessId || !name || !start_date || !end_date) {
    return NextResponse.json({ error: "businessId, name, start_date, end_date are required." }, { status: 400 });
  }

  const auth = await resolveBusinessAuth(req, businessId);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("business_offers")
    .insert({
      business_id: businessId,
      name,
      description: description ?? null,
      discount_percent: discount_percent ?? null,
      discount_label: discount_label ?? null,
      start_date,
      end_date,
      image_url: image_url ?? null,
      created_by: auth.data.userId,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
