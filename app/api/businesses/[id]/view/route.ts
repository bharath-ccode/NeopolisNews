import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("businesses")
    .select("view_count")
    .eq("id", params.id)
    .single();
  if (data) {
    await admin
      .from("businesses")
      .update({ view_count: (data.view_count ?? 0) + 1 })
      .eq("id", params.id);
  }
  return NextResponse.json({ ok: true });
}
