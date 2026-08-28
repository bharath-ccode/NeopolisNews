import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

/** GET — the token user's threads (buyer or seller) with unread counts. */
export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const userId = auth.user.id;

  const admin = createAdminClient();
  const { data: threads, error } = await admin
    .from("message_threads")
    .select("id, classified_id, listing_title, buyer_user_id, buyer_name, seller_user_id, seller_name, last_message_at")
    .or(`buyer_user_id.eq.${userId},seller_user_id.eq.${userId}`)
    .order("last_message_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!threads?.length) return NextResponse.json([]);

  const { data: unread } = await admin
    .from("thread_messages")
    .select("thread_id")
    .in("thread_id", threads.map((t) => t.id))
    .eq("is_read", false)
    .neq("sender_user_id", userId);

  const unreadMap = (unread ?? []).reduce<Record<string, number>>((acc, m) => {
    acc[m.thread_id] = (acc[m.thread_id] ?? 0) + 1;
    return acc;
  }, {});

  return NextResponse.json(
    threads.map((t) => ({
      ...t,
      other_name: t.buyer_user_id === userId ? t.seller_name : t.buyer_name,
      am_seller:  t.seller_user_id === userId,
      unread:     unreadMap[t.id] ?? 0,
    }))
  );
}

/** POST { classified_id, sender_name, body } — start (or continue) a thread
 *  with a listing's seller. Buyer identity comes from the token. */
export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const user_id = auth.user.id;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { classified_id, sender_name, body: msgBody } = body as {
    classified_id?: string; sender_name?: string; body?: string;
  };

  if (!classified_id)      return NextResponse.json({ error: "classified_id required" }, { status: 400 });
  if (!sender_name?.trim())return NextResponse.json({ error: "sender_name required" }, { status: 400 });
  if (!msgBody?.trim())    return NextResponse.json({ error: "Please write a message." }, { status: 400 });
  if (msgBody.trim().length > 2000)
    return NextResponse.json({ error: "Message is too long (max 2000 characters)." }, { status: 400 });

  const admin = createAdminClient();

  const { data: listing } = await admin
    .from("classifieds")
    .select("id, user_id, owner_name, project_name, property_type, listing_type, bedrooms, status")
    .eq("id", classified_id)
    .single();
  if (!listing || listing.status !== "active")
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  if (listing.user_id === user_id)
    return NextResponse.json({ error: "This is your own listing." }, { status: 400 });

  const title = `${listing.bedrooms ? `${listing.bedrooms} BHK ` : ""}${String(listing.property_type).replace("_", " ")} for ${listing.listing_type}${listing.project_name ? ` · ${listing.project_name}` : ""}`;

  // Find or create the thread
  const { data: existing } = await admin
    .from("message_threads")
    .select("id")
    .eq("classified_id", classified_id)
    .eq("buyer_user_id", user_id)
    .maybeSingle();

  let threadId = existing?.id;
  if (!threadId) {
    const { data: thread, error: threadErr } = await admin
      .from("message_threads")
      .insert({
        classified_id,
        listing_title:  title,
        buyer_user_id:  user_id,
        buyer_name:     sender_name.trim(),
        seller_user_id: listing.user_id,
        seller_name:    listing.owner_name,
      })
      .select("id")
      .single();
    if (threadErr) return NextResponse.json({ error: threadErr.message }, { status: 500 });
    threadId = thread.id;
  }

  const { error: msgErr } = await admin.from("thread_messages").insert({
    thread_id:      threadId,
    sender_user_id: user_id,
    sender_name:    sender_name.trim(),
    body:           msgBody.trim(),
  });
  if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });

  await admin
    .from("message_threads")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", threadId);

  return NextResponse.json({ thread_id: threadId }, { status: 201 });
}
