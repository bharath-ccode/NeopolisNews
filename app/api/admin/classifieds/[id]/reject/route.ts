import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { note } = await req.json().catch(() => ({}));
  const admin = createAdminClient();
  const { error } = await admin
    .from("classifieds")
    .update({ status: "rejected", rejection_note: note || null })
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
