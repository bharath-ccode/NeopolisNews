import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/** DELETE — wipe every row from business_discovery_candidates (pending,
 *  approved, and rejected alike). Does not touch businesses already
 *  promoted from a candidate — this only clears the review queue, so
 *  re-running discovery afterward starts fresh instead of skipping
 *  already-seen place_ids. Protected by middleware (/api/admin/*). */
export async function DELETE() {
  const admin = createAdminClient();
  const { error } = await admin.from("business_discovery_candidates").delete().not("id", "is", null);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
