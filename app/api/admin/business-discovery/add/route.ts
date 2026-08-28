import { NextRequest, NextResponse } from "next/server";
import { addDiscoveredBusiness } from "@/lib/businessDiscovery";

/** POST { place, industry, type, subtype, reviewedBy? } — adds one place
 *  picked out of a name search straight to businesses. Protected by
 *  middleware (/api/admin/*). */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { place, industry, type, subtype, reviewedBy } = body ?? {};

  if (!place?.placeId || !industry || !type || !subtype) {
    return NextResponse.json({ error: "Missing place, industry, type, or subtype." }, { status: 400 });
  }

  try {
    const { businessId } = await addDiscoveredBusiness(place, industry, type, subtype, reviewedBy ?? "admin");
    return NextResponse.json({ businessId });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to add" }, { status: 500 });
  }
}
