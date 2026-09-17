import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { findPlaceMatch } from "@/lib/businessDedup";

/** POST { name, address } — public, no-op preview used by /register-business
 *  to show "we found this on Google — is this you?" before the owner fills
 *  in their contact details. Nothing is written; the actual dedupe/block
 *  check happens again, server-side, at /api/businesses/register. */
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "check-place-match", { limit: 15, windowMs: 10 * 60_000 });
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const name = (body?.name ?? "").trim();
  const address = (body?.address ?? "").trim();
  if (!name || !address) return NextResponse.json({ error: "name and address required" }, { status: 400 });

  const match = await findPlaceMatch(name, address);
  if (!match) return NextResponse.json({ placeId: null, placeName: null, placeAddress: null, existingBusiness: null });

  return NextResponse.json({
    placeId: match.placeId,
    placeName: match.placeName,
    placeAddress: match.placeAddress,
    existingBusiness: match.existingBusiness
      ? {
          id: match.existingBusiness.id,
          name: match.existingBusiness.name,
          claimed: !!match.existingBusiness.owner_id,
        }
      : null,
  });
}
