import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("articles")
    .select("views")
    .eq("id", params.id)
    .single();
  if (data) {
    await admin
      .from("articles")
      .update({ views: (data.views ?? 0) + 1 })
      .eq("id", params.id);
  }
  return NextResponse.json({ ok: true });
}
