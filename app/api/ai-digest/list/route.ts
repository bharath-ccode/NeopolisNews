import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "date param required" }, { status: 400 });
  }

  const sb = createAdminClient();
  const { data, error } = await sb
    .from("articles")
    .select("id, title, excerpt, content, read_time, digest_level, digest_date, status")
    .eq("digest_date", date)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ articles: data ?? [] });
}
