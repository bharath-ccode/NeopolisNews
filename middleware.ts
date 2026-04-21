import { NextResponse, type NextRequest } from "next/server";

// Auth is handled client-side by AdminShell (AdminAuthContext + useEffect redirect).
// Middleware just passes all requests through — no cookie check needed since
// @supabase/supabase-js stores sessions in localStorage, not cookies.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
