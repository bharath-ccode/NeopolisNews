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
// Localities that don't offer every tier. Neopolis has no Affordable tier.
const LOCALITY_EXCLUDED_TIERS: Record<string, readonly string[]> = {
  Neopolis: ["affordable"],
};

/** Returns every monthly snapshot — callers derive "current" as the latest
 *  period_month per (locality, tier, lifecycle_status) combination. */
export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("locality_price_trends")
    .select("id, locality, tier, lifecycle_status, price, period_month, updated_at")
    .order("locality")
    .order("tier")
    .order("lifecycle_status")
    .order("period_month");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

function currentMonthStart(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
}

/** POST { locality, tier, lifecycle_status, price } — records this calendar
 *  month's snapshot for the combination. Saving again in the same month
 *  overwrites that month (e.g. correcting a typo); a new month always adds
 *  a new snapshot rather than replacing history. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { locality, tier, lifecycle_status, price } = body ?? {};

  if (!LOCALITIES.includes(locality))
    return NextResponse.json({ error: `locality must be one of: ${LOCALITIES.join(", ")}` }, { status: 400 });
  if (!TIERS.includes(tier))
    return NextResponse.json({ error: `tier must be one of: ${TIERS.join(", ")}` }, { status: 400 });
  if (LOCALITY_EXCLUDED_TIERS[locality]?.includes(tier))
    return NextResponse.json({ error: `${locality} has no ${tier} tier` }, { status: 400 });
  if (!STAGES.includes(lifecycle_status))
    return NextResponse.json({ error: `lifecycle_status must be one of: ${STAGES.join(", ")}` }, { status: 400 });
  const value = Number(price);
  if (!value || value <= 0)
    return NextResponse.json({ error: "price must be a positive number" }, { status: 400 });

  const admin = createAdminClient();

  // Floor is per-locality and admin-configurable (/admin/price-trends) — not
  // a hardcoded number. This check gives a friendly error; the database
  // trigger (20260815) backstops it regardless of entry point.
  const { data: floorRow } = await admin
    .from("locality_price_floors")
    .select("floor_price")
    .eq("locality", locality)
    .maybeSingle();
  const floor = floorRow?.floor_price ?? 6000;
  if (value < floor)
    return NextResponse.json(
      { error: `price must be at least ₹${Number(floor).toLocaleString("en-IN")}/sq ft for ${locality}` },
      { status: 400 }
    );

  const { data, error } = await admin
    .from("locality_price_trends")
    .upsert(
      {
        locality, tier, lifecycle_status, price: value,
        period_month: currentMonthStart(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "locality,tier,lifecycle_status,period_month" }
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
