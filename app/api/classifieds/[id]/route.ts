import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  // Only allow deletion of own non-broker listings
  const { data: existing } = await admin
    .from("classifieds")
    .select("id, user_id, broker_id, status")
    .eq("id", params.id)
    .single();

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (existing.broker_id) return NextResponse.json({ error: "Broker listings must be deleted from the broker portal" }, { status: 403 });

  const { error } = await admin.from("classifieds").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
