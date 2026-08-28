import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { geocodeAddress } from "@/lib/googleGeocode";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** One-off maintenance action: geocode any business that has an address
 *  but no coordinates yet — covers businesses created directly (register /
 *  admin-create) before geocoding was wired into those routes. Places-
 *  sourced businesses are already backfilled via SQL from their candidate
 *  row's coordinates (see 20260829_business_coordinates.sql). */
export async function POST() {
  const sb = createAdminClient();
  const { data: businesses, error } = await sb
    .from("businesses")
    .select("id, address")
    .is("latitude", null)
    .not("address", "is", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let updated = 0;
  let failed = 0;
  for (const b of businesses ?? []) {
    const coords = await geocodeAddress(b.address as string);
    if (!coords) { failed++; continue; }
    const { error: updErr } = await sb
      .from("businesses")
      .update({ latitude: coords.lat, longitude: coords.lng })
      .eq("id", b.id);
    if (updErr) failed++; else updated++;
  }

  return NextResponse.json({ total: businesses?.length ?? 0, updated, failed });
}
