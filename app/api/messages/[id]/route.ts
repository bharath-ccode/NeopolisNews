import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

async function getThreadForUser(admin: ReturnType<typeof createAdminClient>, threadId: string, userId: string) {
  const { data: thread } = await admin
    .from("message_threads")
    .select("id, classified_id, listing_title, buyer_user_id, buyer_name, seller_user_id, seller_name")
    .eq("id", threadId)
    .single();
  if (!thread || (thread.buyer_user_id !== userId && thread.seller_user_id !== userId)) return null;
  return thread;
}

/** GET — thread messages for a participant (token-verified); marks the other
 *  side's messages read. */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireUser(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const userId = auth.user.id;

  const admin = createAdminClient();
  const thread = await getThreadForUser(admin, params.id, userId);
  if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

  const { data: messages, error } = await admin
    .from("thread_messages")
    .select("id, sender_user_id, sender_name, body, created_at")
    .eq("thread_id", params.id)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await admin
    .from("thread_messages")
    .update({ is_read: true })
    .eq("thread_id", params.id)
    .neq("sender_user_id", userId)
    .eq("is_read", false);

  return NextResponse.json({ thread, messages: messages ?? [] });
}

/** POST { sender_name, body } — reply in a thread (token-verified participant). */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireUser(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const user_id = auth.user.id;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { sender_name, body: msgBody } =
    body as { sender_name?: string; body?: string };

  if (!sender_name?.trim()) return NextResponse.json({ error: "sender_name required" }, { status: 400 });
  if (!msgBody?.trim())     return NextResponse.json({ error: "Please write a message." }, { status: 400 });

  const admin = createAdminClient();
  const thread = await getThreadForUser(admin, params.id, user_id);
  if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

  const { data, error } = await admin
    .from("thread_messages")
    .insert({
      thread_id:      params.id,
      sender_user_id: user_id,
      sender_name:    sender_name.trim(),
      body:           msgBody.trim(),
    })
    .select("id, sender_user_id, sender_name, body, created_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await admin
    .from("message_threads")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", params.id);

  return NextResponse.json(data, { status: 201 });
}
