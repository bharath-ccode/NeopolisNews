import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("business_events")
    .select("*, businesses(id, name)")
    .order("event_date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { businessId, name, event_type, event_date, end_date, start_time, end_time, description, image_url, is_free, ticket_price, total_slots } = body ?? {};

  if (!businessId || !name || !event_type || !event_date || !start_time || !end_time) {
    return NextResponse.json({ error: "businessId, name, event_type, event_date, start_time, end_time are required." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("business_events")
    .insert({
      business_id: businessId, name, event_type, event_date,
      end_date: end_date ?? null,
      start_time, end_time,
      description: description || null,
      image_url: image_url || null,
      is_free: is_free ?? true,
      ticket_price: ticket_price ?? null,
      total_slots: total_slots ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
