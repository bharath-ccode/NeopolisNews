import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { resolveBusinessAuth } from "@/lib/myBusinessAuth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const {
    businessId, name, title, qualifications, registration_number,
    years_experience, consultation_fee, bio,
  } = body ?? {};

  if (!businessId) return NextResponse.json({ error: "businessId required." }, { status: 400 });

  const auth = await resolveBusinessAuth(req, businessId);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const patch: Record<string, unknown> = {};
  if (name !== undefined)                 patch.name = name.trim();
  if (title !== undefined)                patch.title = title?.trim() || null;
  if (qualifications !== undefined)       patch.qualifications = qualifications?.trim() || null;
  if (registration_number !== undefined)  patch.registration_number = registration_number?.trim() || null;
  if (years_experience !== undefined)     patch.years_experience = years_experience ? Number(years_experience) : null;
  if (consultation_fee !== undefined)     patch.consultation_fee = consultation_fee ? Number(consultation_fee) : null;
  if (bio !== undefined)                  patch.bio = bio?.trim() || null;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("practitioners")
    .update(patch)
    .eq("id", params.id)
    .eq("business_id", businessId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required." }, { status: 400 });

  const auth = await resolveBusinessAuth(req, businessId);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();
  const { error } = await admin
    .from("practitioners")
    .delete()
    .eq("id", params.id)
    .eq("business_id", businessId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
