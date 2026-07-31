import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { notifyMatchingSavedSearches } from "@/lib/savedSearchAlerts";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = createAdminClient();

  const { data: before } = await admin
    .from("classifieds")
    .select("status")
    .eq("id", params.id)
    .single();

  const { error } = await admin
    .from("classifieds")
    .update({ status: "active", verified_at: new Date().toISOString() })
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Newly activated → alert matching saved searches
  if (before?.status !== "active") {
    await notifyMatchingSavedSearches(admin, params.id);
  }

  return NextResponse.json({ ok: true });
}
