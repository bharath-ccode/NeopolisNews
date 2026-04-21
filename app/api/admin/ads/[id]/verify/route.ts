import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = createAdminClient();

  const { data: ad } = await admin
    .from("ads")
    .select("duration_days")
    .eq("id", params.id)
    .single();

  const verifiedAt = new Date();
  const expiresAt  = new Date(verifiedAt);
  expiresAt.setDate(expiresAt.getDate() + (ad?.duration_days ?? 30));

  const { error } = await admin
    .from("ads")
    .update({
      status:      "active",
      verified_at: verifiedAt.toISOString(),
      expires_at:  expiresAt.toISOString(),
    })
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
