import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { resolveBusinessAuth } from "@/lib/myBusinessAuth";
import { detectProvider } from "@/lib/videoProviders";

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required." }, { status: 400 });

  const auth = await resolveBusinessAuth(req, businessId);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("wellness_sessions")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const {
    businessId, trainer_name, session_type, language, description,
    price_inr, max_seats, meeting_link, start_date, end_date,
  } = body ?? {};

  if (!businessId || !trainer_name || !session_type || !start_date || !end_date || price_inr == null)
    return NextResponse.json({ error: "businessId, trainer_name, session_type, start_date, end_date, price_inr are required." }, { status: 400 });

  const auth = await resolveBusinessAuth(req, businessId);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { provider, label } = meeting_link ? detectProvider(meeting_link) : { provider: "other", label: "Other" };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("wellness_sessions")
    .insert({
      business_id: businessId,
      trainer_name,
      session_type,
      language: language ?? "English",
      description: description?.trim() || null,
      price_inr: Number(price_inr),
      max_seats: Number(max_seats ?? 20),
      meeting_link: meeting_link?.trim() || null,
      platform: provider,
      platform_label: label,
      start_date,
      end_date,
      status: "draft",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
