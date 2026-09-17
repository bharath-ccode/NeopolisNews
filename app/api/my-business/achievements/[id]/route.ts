import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { resolveBusinessAuth } from "@/lib/myBusinessAuth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const { businessId, student_name, class_grade, title, category, achieved_date, image_url } = body ?? {};

  if (!businessId) return NextResponse.json({ error: "businessId required." }, { status: 400 });

  const auth = await resolveBusinessAuth(req, businessId);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const patch: Record<string, unknown> = {};
  if (student_name !== undefined)   patch.student_name = student_name?.trim() || null;
  if (class_grade !== undefined)    patch.class_grade = class_grade?.trim() || null;
  if (title !== undefined)          patch.title = title.trim();
  if (category !== undefined)       patch.category = category?.trim() || null;
  if (achieved_date !== undefined)  patch.achieved_date = achieved_date || null;
  if (image_url !== undefined)      patch.image_url = image_url || null;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("school_achievements")
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
    .from("school_achievements")
    .delete()
    .eq("id", params.id)
    .eq("business_id", businessId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
