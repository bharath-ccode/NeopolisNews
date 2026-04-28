import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.title || !body?.description || !body?.category || !body?.ownerName || !body?.contactPhone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("ads")
    .insert({
      user_id:       user?.id ?? null,
      owner_name:    body.ownerName,
      contact_phone: body.contactPhone,
      category:      body.category,
      title:         body.title,
      description:   body.description,
      price:         body.price || null,
      photos:        body.photos ?? [],
      duration_days: body.durationDays ?? 30,
      status:        "pending",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
