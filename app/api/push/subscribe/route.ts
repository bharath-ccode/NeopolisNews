import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { optionalUser } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

const ALLOWED_TOPICS = ["deals", "news", "clubs"] as const;

/** POST { subscription: { endpoint, keys: { p256dh, auth } }, topics: string[] }
 *  Upserts by endpoint; links to the user when signed in. */
export async function POST(req: NextRequest) {
  const user = await optionalUser(req);

  const body = await req.json().catch(() => null);
  const sub = body?.subscription;
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth)
    return NextResponse.json({ error: "Invalid subscription object." }, { status: 400 });

  const topics: string[] = Array.isArray(body?.topics)
    ? body.topics.filter((t: string) => (ALLOWED_TOPICS as readonly string[]).includes(t))
    : [];

  const admin = createAdminClient();

  // Merge topics if this endpoint is already registered
  const { data: existing } = await admin
    .from("push_subscriptions")
    .select("id, topics")
    .eq("endpoint", sub.endpoint)
    .maybeSingle();

  const mergedTopics = Array.from(new Set([...(existing?.topics ?? []), ...topics]));

  const { error } = await admin.from("push_subscriptions").upsert(
    {
      endpoint: sub.endpoint,
      p256dh:   sub.keys.p256dh,
      auth:     sub.keys.auth,
      user_id:  user?.id ?? null,
      topics:   mergedTopics,
    },
    { onConflict: "endpoint" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, topics: mergedTopics }, { status: 201 });
}

/** DELETE { endpoint } — remove a subscription entirely. */
export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.endpoint) return NextResponse.json({ error: "endpoint required" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", body.endpoint);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
