import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await req.json().catch(() => null);
  const { name, email, phone, proofUrl } = body ?? {};

  if (!name?.trim() || !email?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: "Name, email, and phone are required." }, { status: 400 });
  }
  if (!email.includes("@")) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Confirm business exists and hasn't been claimed
  const { data: biz, error: bizErr } = await supabase
    .from("businesses")
    .select("id, status, owner_email")
    .eq("id", id)
    .single();

  if (bizErr || !biz) {
    return NextResponse.json({ error: "Business not found." }, { status: 404 });
  }
  if (biz.status === "active") {
    return NextResponse.json({ error: "This business has already been claimed." }, { status: 409 });
  }
  if (biz.status === "pending") {
    return NextResponse.json({ error: "A verification request is already pending for this business." }, { status: 409 });
  }
  if (biz.owner_email) {
    return NextResponse.json({ error: "This business already has owner details on file. Use the standard claim flow." }, { status: 409 });
  }

  // Insert verification request
  const { error: insertErr } = await supabase
    .from("verification_requests")
    .insert({
      business_id: id,
      submitter_name: name.trim(),
      submitter_email: email.trim().toLowerCase(),
      submitter_phone: phone.trim(),
      proof_url: proofUrl ?? null,
      status: "pending",
    });

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // Update business status to pending
  await supabase.from("businesses").update({ status: "pending" }).eq("id", id);

  return NextResponse.json({ ok: true });
}
