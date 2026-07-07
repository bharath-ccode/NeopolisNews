import webpush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";

const PUBLIC_KEY  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? "";
const SUBJECT     = process.env.VAPID_SUBJECT ?? "mailto:admin@neopolis.news";

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

interface SubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

function configured(): boolean {
  return Boolean(PUBLIC_KEY && PRIVATE_KEY);
}

/** Send to a set of subscription rows; prunes dead endpoints (404/410).
 *  Never throws — push failures must not break the triggering request. */
async function sendToRows(
  admin: SupabaseClient,
  rows: SubscriptionRow[],
  payload: PushPayload
): Promise<number> {
  if (!configured() || rows.length === 0) return 0;
  webpush.setVapidDetails(SUBJECT, PUBLIC_KEY, PRIVATE_KEY);

  const body = JSON.stringify(payload);
  const dead: string[] = [];
  let sent = 0;

  await Promise.allSettled(
    rows.map(async (row) => {
      try {
        await webpush.sendNotification(
          { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
          body
        );
        sent++;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) dead.push(row.id);
      }
    })
  );

  if (dead.length) {
    await admin.from("push_subscriptions").delete().in("id", dead);
  }
  return sent;
}

/** Push to everyone subscribed to a topic (e.g. "deals", "news"). */
export async function pushToTopic(
  admin: SupabaseClient,
  topic: string,
  payload: PushPayload
): Promise<number> {
  try {
    if (!configured()) return 0;
    const { data } = await admin
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .contains("topics", [topic]);
    return await sendToRows(admin, data ?? [], payload);
  } catch (err) {
    console.error("pushToTopic failed:", err);
    return 0;
  }
}

/** Push to specific signed-in users (any topic). */
export async function pushToUsers(
  admin: SupabaseClient,
  userIds: string[],
  payload: PushPayload
): Promise<number> {
  try {
    if (!configured() || userIds.length === 0) return 0;
    const { data } = await admin
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .in("user_id", userIds);
    return await sendToRows(admin, data ?? [], payload);
  } catch (err) {
    console.error("pushToUsers failed:", err);
    return 0;
  }
}
