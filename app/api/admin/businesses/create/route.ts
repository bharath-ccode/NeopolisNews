import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { geocodeAddress } from "@/lib/googleGeocode";
import { findPlaceMatch } from "@/lib/businessDedup";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { name, industry, types, subtypes, address, website, ownerEmail, ownerPhone, activateNow, verifyNow } = body ?? {};

  if (!name || !industry || !types?.length || !address) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  // Same physical place may already be listed via Google-sourced discovery —
  // don't create a second row; point the admin at the existing one instead
  // (approve/claim it, or use Business Discovery's search-by-name tool).
  const match = await findPlaceMatch(name, address);
  if (match?.existingBusiness) {
    const existing = match.existingBusiness;
    return NextResponse.json(
      {
        error: `"${existing.name}" already exists (id ${existing.id}, ${existing.owner_id ? "claimed" : "unclaimed"}) — likely the same place sourced via Business Discovery. Use that listing instead of creating a new one.`,
      },
      { status: 409 }
    );
  }

  const id = Math.random().toString(36).slice(2, 10).toUpperCase();
  const coords = await geocodeAddress(address);

  const supabase = createAdminClient();
  const { error } = await supabase.from("businesses").insert({
    id,
    name,
    industry,
    types,
    subtypes: subtypes ?? [],
    address,
    status: activateNow ? "active" : "invited",
    created_at: new Date().toISOString(),
    verified: verifyNow ? true : false,
    website: website || null,
    owner_email: ownerEmail || null,
    owner_phone: ownerPhone || null,
    latitude: coords?.lat ?? null,
    longitude: coords?.lng ?? null,
    place_id: match?.placeId ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id, name, status: activateNow ? "active" : "invited", verified: verifyNow ? true : false });
}
