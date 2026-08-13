import { NextRequest, NextResponse } from "next/server";
import { rejectCandidate } from "@/lib/healthDiscovery";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  await rejectCandidate(params.id, body?.reviewedBy ?? "admin");
  return NextResponse.json({ ok: true });
}
