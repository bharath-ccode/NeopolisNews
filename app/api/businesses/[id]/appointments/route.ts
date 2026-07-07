import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { optionalUser } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

const SLOTS = ["morning", "afternoon", "evening"] as const;

/** POST — request an appointment with a business (public). */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await optionalUser(req);

  const body = await req.json().catch(() => null);
  const { customer_name, customer_phone, preferred_date, preferred_slot, note } = body ?? {};

  if (!customer_name?.trim())  return NextResponse.json({ error: "Please enter your name." },         { status: 400 });
  if (!customer_phone?.trim()) return NextResponse.json({ error: "Please enter your phone number." }, { status: 400 });
  if (!preferred_date)         return NextResponse.json({ error: "Please pick a date." },             { status: 400 });
  if (!SLOTS.includes(preferred_slot))
    return NextResponse.json({ error: "Please pick a time slot." }, { status: 400 });

  const date = new Date(preferred_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (isNaN(date.getTime()) || date < today)
    return NextResponse.json({ error: "Please pick today or a future date." }, { status: 400 });

  const admin = createAdminClient();

  const { data: biz } = await admin
    .from("businesses")
    .select("id, status")
    .eq("id", params.id)
    .single();
  if (!biz || biz.status !== "active")
    return NextResponse.json({ error: "Business not found." }, { status: 404 });

  const { data, error } = await admin
    .from("appointment_requests")
    .insert({
      business_id:    params.id,
      user_id:        user?.id ?? null,
      customer_name:  customer_name.trim(),
      customer_phone: customer_phone.trim(),
      preferred_date,
      preferred_slot,
      note:           note?.trim() || null,
    })
    .select("id, preferred_date, preferred_slot, status")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
