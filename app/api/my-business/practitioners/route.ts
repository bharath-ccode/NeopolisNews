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
    .from("practitioners")
    .select("*")
    .eq("business_id", businessId)
    .order("position", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const {
    businessId, name, title, qualifications, registration_number,
    years_experience, consultation_fee, bio,
  } = body ?? {};

  if (!businessId || !name?.trim())
    return NextResponse.json({ error: "businessId and name are required." }, { status: 400 });

  const auth = await resolveBusinessAuth(req, businessId);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();

  const { count } = await admin
    .from("practitioners")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId);

  const { data, error } = await admin
    .from("practitioners")
    .insert({
      business_id: businessId,
      name: name.trim(),
      title: title?.trim() || null,
      qualifications: qualifications?.trim() || null,
      registration_number: registration_number?.trim() || null,
      years_experience: years_experience ? Number(years_experience) : null,
      consultation_fee: consultation_fee ? Number(consultation_fee) : null,
      bio: bio?.trim() || null,
      position: count ?? 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
