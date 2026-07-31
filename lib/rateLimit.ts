import { NextRequest, NextResponse } from "next/server";

/**
 * In-memory sliding-window rate limiter for public POST routes.
 *
 * Best-effort by design: state lives per server instance, so on serverless
 * hosting concurrent instances each keep their own window. That still stops
 * the practical spam case (one client hammering one endpoint) without any
 * external store. Content-level caps (e.g. "max 3 pending reports") remain
 * the durable backstop where they exist.
 */

const buckets = new Map<string, number[]>();
let lastSweep = Date.now();

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Drop stale buckets occasionally so the map can't grow unbounded. */
function sweep(now: number, windowMs: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, hits] of buckets) {
    const alive = hits.filter((t) => now - t < windowMs);
    if (alive.length === 0) buckets.delete(key);
    else buckets.set(key, alive);
  }
}

export interface RateLimitOptions {
  /** Max requests allowed inside the window. */
  limit: number;
  /** Window length in ms (default 10 minutes). */
  windowMs?: number;
}

/**
 * Returns null when allowed, or a ready-to-return 429 response when the
 * caller has exceeded `limit` requests in the window for this route key.
 *
 *   const limited = rateLimit(req, "reviews", { limit: 3 });
 *   if (limited) return limited;
 */
export function rateLimit(
  req: NextRequest,
  routeKey: string,
  { limit, windowMs = 10 * 60_000 }: RateLimitOptions
): NextResponse | null {
  const now = Date.now();
  sweep(now, windowMs);

  const key = `${routeKey}:${clientIp(req)}`;
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (hits.length >= limit) {
    const retryAfterSec = Math.ceil((windowMs - (now - hits[0])) / 1000);
    return NextResponse.json(
      { error: "Too many requests — please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
    );
  }

  hits.push(now);
  buckets.set(key, hits);
  return null;
}
