import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** GET ?user_id= — saved items. Add &expand=1 to include project/classified details. */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id");
  const expand = req.nextUrl.searchParams.get("expand") === "1";
  if (!userId) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  const admin = createAdminClient();
  const { data: saved, error } = await admin
    .from("saved_properties")
    .select("id, item_type, item_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!expand) return NextResponse.json(saved ?? []);

  const projectIds    = (saved ?? []).filter((s) => s.item_type === "project").map((s) => s.item_id);
  const classifiedIds = (saved ?? []).filter((s) => s.item_type === "classified").map((s) => s.item_id);

  const [projectsRes, classifiedsRes] = await Promise.all([
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
  ]);

  const projects    = new Map((projectsRes.data ?? []).map((p) => [String(p.id), p]));
  const classifieds = new Map((classifiedsRes.data ?? []).map((c) => [String(c.id), c]));

  const items = (saved ?? []).map((s) => ({
    ...s,
    detail:
      s.item_type === "project"
        ? projects.get(s.item_id) ?? null
        : classifieds.get(s.item_id) ?? null,
  }));

  return NextResponse.json(items);
}

/** POST { user_id, item_type, item_id } — toggle save. Returns { saved: boolean }. */
export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { user_id, item_type, item_id } =
    body as { user_id?: string; item_type?: string; item_id?: string };

  if (!user_id) return NextResponse.json({ error: "Sign in to save properties." }, { status: 401 });
  if (item_type !== "project" && item_type !== "classified")
    return NextResponse.json({ error: "item_type must be 'project' or 'classified'" }, { status: 400 });
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
