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
    .from("business_enquiries")
    .select("id, sender_name, sender_phone, message, is_read, created_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { businessId, enquiryId } = body ?? {};
  if (!businessId || !enquiryId)
    return NextResponse.json({ error: "businessId and enquiryId required." }, { status: 400 });

  const auth = await resolveBusinessAuth(req, businessId);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();
  const { error } = await admin
    .from("business_enquiries")
    .update({ is_read: true })
    .eq("id", enquiryId)
    .eq("business_id", businessId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
