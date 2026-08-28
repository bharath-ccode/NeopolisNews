import { NextRequest, NextResponse } from "next/server";
import { searchByName } from "@/lib/businessDiscovery";

/** POST { query: string } — ad-hoc Places name search, results are not
 *  persisted. Protected by middleware (/api/admin/*). */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const query = typeof body?.query === "string" ? body.query.trim() : "";
  if (!query) return NextResponse.json({ error: "Enter a business name to search." }, { status: 400 });

  try {
    const results = await searchByName(query);
    return NextResponse.json(results);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Search failed" }, { status: 500 });
  }
}
