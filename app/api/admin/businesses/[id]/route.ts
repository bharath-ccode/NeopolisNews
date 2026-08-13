import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/** DELETE — remove a business (e.g. a duplicate). Every business-owned
 *  table (events, offers, news, reviews, wellness sessions, enquiries,
 *  updates, appointment requests, now-showing, discovery candidates) has
 *  "on delete cascade"/"on delete set null" and is cleaned up
 *  automatically. saved_properties has no FK (generic item_type/item_id
 *  pointer), so favorites are cleared explicitly first. */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = createAdminClient();

  await admin.from("saved_properties").delete().eq("item_type", "business").eq("item_id", params.id);

  const { error } = await admin.from("businesses").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
