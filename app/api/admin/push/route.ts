import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { pushToTopic } from "@/lib/push";

export const dynamic = "force-dynamic";

/** POST { title, body, url?, topic } — admin broadcast (guarded by middleware). */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { title, body: msgBody, url, topic } = body ?? {};

  if (!title?.trim())   return NextResponse.json({ error: "title required" }, { status: 400 });
  if (!msgBody?.trim()) return NextResponse.json({ error: "body required" }, { status: 400 });
  if (!["deals", "news", "clubs"].includes(topic))
    return NextResponse.json({ error: "topic must be deals, news or clubs" }, { status: 400 });

  const admin = createAdminClient();
  const sent = await pushToTopic(admin, topic, {
    title: title.trim(),
    body:  msgBody.trim(),
    url:   url?.trim() || "/",
  });

  return NextResponse.json({ ok: true, sent });
}

/** GET — subscriber counts per topic (for the admin UI). */
export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin.from("push_subscriptions").select("topics");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const counts: Record<string, number> = { deals: 0, news: 0, clubs: 0, total: (data ?? []).length };
  for (const row of data ?? []) {
    for (const t of row.topics ?? []) {
      if (counts[t] !== undefined) counts[t]++;
    }
  }
  return NextResponse.json(counts);
}
