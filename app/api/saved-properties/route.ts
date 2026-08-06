import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

/** GET — the token user's saved items. Add &expand=1 for project/classified details. */
export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const userId = auth.user.id;
  const expand = req.nextUrl.searchParams.get("expand") === "1";

  const admin = createAdminClient();
  const { data: saved, error } = await admin
    .from("saved_properties")
    .select("id, item_type, item_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!expand) return NextResponse.json(saved ?? []);

  const idsOf = (type: string) =>
    (saved ?? []).filter((s) => s.item_type === type).map((s) => s.item_id);
  const projectIds    = idsOf("project");
  const classifiedIds = idsOf("classified");
  const businessIds   = idsOf("business");
  const builderIds    = idsOf("builder");
  const eventIds      = idsOf("event");
  const dealIds       = idsOf("deal");

  const none = Promise.resolve({ data: [] as Record<string, unknown>[] });
  const [projectsRes, classifiedsRes, businessesRes, buildersRes, eventsRes, dealsRes] = await Promise.all([
    projectIds.length
      ? admin
          .from("projects")
          .select("id, project_name, price_range_min, price_range_max, lifecycle_status")
          .in("id", projectIds)
      : Promise.resolve({ data: [] as Record<string, unknown>[] }),
    classifiedIds.length
      ? admin
          .from("classifieds")
          .select("id, project_name, standalone_description, property_type, listing_type, bedrooms, price, photos, status")
          .in("id", classifiedIds)
      : Promise.resolve({ data: [] as Record<string, unknown>[] }),
    businessIds.length
      ? admin
          .from("businesses")
          .select("id, name, industry, types, address, logo, contact_phone")
          .in("id", businessIds)
      : none,
    builderIds.length
      ? admin
          .from("builders")
          .select("id, builder_name, logo_url, address, website")
          .in("id", builderIds)
      : none,
    eventIds.length
      ? admin
          .from("business_events")
          .select("id, name, event_type, event_date, start_time, end_time, image_url, business_id, businesses(name)")
          .in("id", eventIds)
      : none,
    dealIds.length
      ? admin
          .from("business_offers")
          .select("id, name, discount_label, discount_percent, end_date, image_url, business_id, businesses(name)")
          .in("id", dealIds)
      : none,
  ]);

  const byId = (rows: Record<string, unknown>[] | null | undefined) =>
    new Map((rows ?? []).map((r) => [String(r.id), r]));
  const detailMaps: Record<string, Map<string, Record<string, unknown>>> = {
    project:    byId(projectsRes.data),
    classified: byId(classifiedsRes.data),
    business:   byId(businessesRes.data),
    builder:    byId(buildersRes.data as Record<string, unknown>[]),
    event:      byId(eventsRes.data as Record<string, unknown>[]),
    deal:       byId(dealsRes.data as Record<string, unknown>[]),
  };

  const items = (saved ?? []).map((s) => ({
    ...s,
    detail: detailMaps[s.item_type]?.get(s.item_id) ?? null,
  }));

  return NextResponse.json(items);
}

/** POST { item_type, item_id } — toggle save for the token user. Returns { saved }. */
export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const user_id = auth.user.id;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { item_type, item_id } =
    body as { item_type?: string; item_id?: string };

  const SAVEABLE_TYPES = ["project", "classified", "business", "builder", "event", "deal"];
  if (!item_type || !SAVEABLE_TYPES.includes(item_type))
    return NextResponse.json(
      { error: `item_type must be one of: ${SAVEABLE_TYPES.join(", ")}` },
      { status: 400 }
    );
  if (!item_id) return NextResponse.json({ error: "item_id required" }, { status: 400 });

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("saved_properties")
    .select("id")
    .eq("user_id", user_id)
    .eq("item_type", item_type)
    .eq("item_id", item_id)
    .maybeSingle();

  if (existing) {
    const { error } = await admin.from("saved_properties").delete().eq("id", existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ saved: false });
  }

  const { error } = await admin
    .from("saved_properties")
    .insert({ user_id, item_type, item_id });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ saved: true }, { status: 201 });
}
