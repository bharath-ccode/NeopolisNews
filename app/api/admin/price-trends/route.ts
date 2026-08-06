import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { LOCALITIES } from "@/lib/projectsStore";

export const dynamic = "force-dynamic";

const TIERS = ["affordable", "premium", "luxury", "uber_luxury"] as const;
// Pre-Launch excluded — quoting a price before RERA registration isn't legal.
const STAGES = [
  "rera_registered", "under_construction", "structure_complete",
  "finishing", "oc_received", "ready_to_move",
] as const;

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("locality_price_trends")
    .select("id, locality, tier, lifecycle_status, price, updated_at")
    .order("locality")
    .order("tier")
    .order("lifecycle_status");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

/** POST { locality, tier, lifecycle_status, price } — upsert one combination. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { locality, tier, lifecycle_status, price } = body ?? {};

  if (!LOCALITIES.includes(locality))
    return NextResponse.json({ error: `locality must be one of: ${LOCALITIES.join(", ")}` }, { status: 400 });
  if (!TIERS.includes(tier))
    return NextResponse.json({ error: `tier must be one of: ${TIERS.join(", ")}` }, { status: 400 });
  if (!STAGES.includes(lifecycle_status))
    return NextResponse.json({ error: `lifecycle_status must be one of: ${STAGES.join(", ")}` }, { status: 400 });
  const value = Number(price);
  if (!value || value <= 0)
    return NextResponse.json({ error: "price must be a positive number" }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("locality_price_trends")
    .upsert(
      { locality, tier, lifecycle_status, price: value, updated_at: new Date().toISOString() },
      { onConflict: "locality,tier,lifecycle_status" }
    )
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}

/** DELETE ?id= */
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from("locality_price_trends").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
