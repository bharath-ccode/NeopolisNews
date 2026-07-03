import { NextResponse, type NextRequest } from "next/server";

// /admin pages remain client-guarded (AdminAuthContext); sessions live in
// localStorage so page-level middleware can't see them. The real security
// boundary is the /api/admin/* routes, which this middleware enforces:
// every call must carry a valid Supabase session (Authorization header or
// the admin_session cookie set by AdminAuthContext), and — when ADMIN_EMAILS
// is configured — the session's email must be on that list.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function adminAllowlist(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

async function resolveEmail(token: string): Promise<string | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const user = await res.json();
    return typeof user?.email === "string" ? user.email.toLowerCase() : null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/admin")) {
    const token =
      (request.headers.get("authorization") ?? "").replace(/^Bearer /i, "").trim() ||
      request.cookies.get("admin_session")?.value ||
      "";

    if (!token) {
      return NextResponse.json({ error: "Admin sign-in required." }, { status: 401 });
    }

    const email = await resolveEmail(token);
    if (!email) {
      return NextResponse.json({ error: "Invalid or expired admin session." }, { status: 401 });
    }

    const allowlist = adminAllowlist();
    if (allowlist.length > 0 && !allowlist.includes(email)) {
      return NextResponse.json({ error: "This account is not an admin." }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
