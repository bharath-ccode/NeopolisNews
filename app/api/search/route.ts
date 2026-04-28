import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  // Sanitise: remove characters that break PostgREST or-filter syntax
  const q = raw.replace(/[,]/g, " ").replace(/\s+/g, " ").trim();

  if (q.length < 2) {
    return NextResponse.json({ businesses: [], properties: [], articles: [] });
  }

  const admin = createAdminClient();
  const p = `%${q}%`;

  const [bizRes, propRes, artRes] = await Promise.all([
    admin
      .from("businesses")
      .select("id, name, industry, address, verified, logo")
      .eq("status", "active")
      .or(`name.ilike.${p},description.ilike.${p},industry.ilike.${p},address.ilike.${p}`)
      .limit(6),

    admin
      .from("classifieds")
      .select("id, property_type, bedrooms, price, listing_type, project_name, standalone_description, sub_category, is_standalone")
      .eq("status", "active")
      .or(`project_name.ilike.${p},standalone_description.ilike.${p},description.ilike.${p}`)
      .limit(6),

    admin
      .from("articles")
      .select("id, title, excerpt, date, tag, tag_color")
      .eq("status", "published")
      .or(`title.ilike.${p},excerpt.ilike.${p}`)
      .limit(6),
  ]);

  return NextResponse.json({
    businesses: bizRes.data ?? [],
    properties: propRes.data ?? [],
    articles: artRes.data ?? [],
  });
}
