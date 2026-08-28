import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { createAdminClient } from "@/lib/supabase/server";

const COOKIE_NAME = "nn_vid";
const YEAR_SECONDS = 60 * 60 * 24 * 365;

/** POST { path, referrer? } — logs one page view. Public, anonymous,
 *  fire-and-forget from the client on every route change. visitor_id
 *  comes from a long-lived cookie (created here on first visit) used only
 *  to estimate unique visitors / session length, never tied to an
 *  account. */
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "track-pageview", { limit: 120, windowMs: 10 * 60_000 });
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const path = typeof body?.path === "string" ? body.path.slice(0, 500) : null;
  if (!path) return NextResponse.json({ error: "path is required." }, { status: 400 });

  const referrer = typeof body?.referrer === "string" ? body.referrer.slice(0, 500) : null;
  const visitorId = req.cookies.get(COOKIE_NAME)?.value ?? randomUUID();

  const admin = createAdminClient();
  const { error } = await admin.from("page_views").insert({
    path,
    visitor_id: visitorId,
    referrer: referrer || null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const res = NextResponse.json({ ok: true }, { status: 201 });
  res.cookies.set(COOKIE_NAME, visitorId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: YEAR_SECONDS,
    path: "/",
  });
  return res;
}
