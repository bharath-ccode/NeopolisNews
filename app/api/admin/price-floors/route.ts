import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { LOCALITIES } from "@/lib/projectsStore";

export const dynamic = "force-dynamic";

/** Every locality's current floor price. */
export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("locality_price_floors")
    .select("locality, floor_price, updated_at")
    .order("locality");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

/** POST { locality, floor_price } — sets one locality's floor. This is the
 *  rule: /api/admin/price-trends enforces prices against it, and the
 *  database backstops it with a trigger regardless of entry point. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { locality, floor_price } = body ?? {};

  if (!LOCALITIES.includes(locality))
    return NextResponse.json({ error: `locality must be one of: ${LOCALITIES.join(", ")}` }, { status: 400 });
  const value = Number(floor_price);
  if (!value || value <= 0)
    return NextResponse.json({ error: "floor_price must be a positive number" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin
    .from("locality_price_floors")
    .upsert(
      { locality, floor_price: value, updated_at: new Date().toISOString() },
      { onConflict: "locality" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
