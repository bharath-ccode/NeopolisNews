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
    delivery_mode, session_time, address,
  } = body ?? {};

  if (!businessId || !trainer_name || !session_type || !start_date || !end_date || price_inr == null)
    return NextResponse.json({ error: "businessId, trainer_name, session_type, start_date, end_date, price_inr are required." }, { status: 400 });

  const auth = await resolveBusinessAuth(req, businessId);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();

  // Only admin-approved gyms/studios may publish sessions.
  const { data: biz } = await admin
    .from("businesses")
    .select("approved_for_sessions")
    .eq("id", businessId)
    .single();
  if (!biz?.approved_for_sessions)
    return NextResponse.json({ error: "This business is not approved to create live sessions. Contact admin to get approved." }, { status: 403 });

  const mode = delivery_mode === "on_location" ? "on_location" : "online";
  const { provider, label } = (mode === "online" && meeting_link)
    ? detectProvider(meeting_link)
    : { provider: "other", label: "Other" };

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
      delivery_mode: mode,
      session_time: session_time || null,
      address: mode === "on_location" ? (address?.trim() || null) : null,
      meeting_link: mode === "online" ? (meeting_link?.trim() || null) : null,
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
