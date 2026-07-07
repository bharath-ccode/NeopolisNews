import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { resolveBusinessAuth } from "@/lib/myBusinessAuth";
import { awardPoints, APPOINTMENT_VISIT_POINTS } from "@/lib/points";

export const dynamic = "force-dynamic";

const STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;

/** GET ?businessId= — appointment requests for the owner's business. */
export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId") ?? "";
  const auth = await resolveBusinessAuth(req, businessId);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("appointment_requests")
    .select("id, customer_name, customer_phone, preferred_date, preferred_slot, note, status, created_at")
    .eq("business_id", businessId)
    .order("preferred_date", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

/** PATCH { businessId, id, status } — update a request's status. */
export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { businessId, id, status } = body ?? {};

  if (!businessId || !id) return NextResponse.json({ error: "businessId and id required" }, { status: 400 });
  if (!STATUSES.includes(status))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const auth = await resolveBusinessAuth(req, businessId);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();
  const { data: updated, error } = await admin
    .from("appointment_requests")
    .update({ status })
    .eq("id", id)
    .eq("business_id", businessId)
    .select("id, user_id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Visit verified by the business → award points to the signed-in booker.
  // Idempotent per appointment, so flipping statuses never double-awards.
  if (status === "completed" && updated?.user_id) {
    await awardPoints(admin, {
      userId:      updated.user_id,
      points:      APPOINTMENT_VISIT_POINTS,
      sourceType:  "appointment_visit",
      sourceId:    updated.id,
      description: `Visited ${auth.data.businessName}`,
    });
  }

  return NextResponse.json({ ok: true });
}
