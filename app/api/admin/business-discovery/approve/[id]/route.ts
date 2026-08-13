import { NextRequest, NextResponse } from "next/server";
import { promoteCandidateToBusiness } from "@/lib/businessDiscovery";

/** POST { name?, phone?, email?, address?, website?, timings?, reviewedBy? }
 *  Any field omitted falls back to the discovered value (or the parsed
 *  Google hours, for timings). */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const { reviewedBy, ...overrides } = body ?? {};

  try {
    const { businessId } = await promoteCandidateToBusiness(params.id, overrides, reviewedBy ?? "admin");
    return NextResponse.json({ businessId });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to approve" }, { status: 500 });
  }
}
