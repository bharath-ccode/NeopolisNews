import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** GET ?token= — one-click unsubscribe link used in emails. Returns a tiny HTML page. */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  let heading = "Link not valid";
  let message = "This unsubscribe link is missing or malformed.";

  if (token) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("project_subscriptions")
      .update({ is_active: false })
      .eq("unsubscribe_token", token)
      .select("email")
      .maybeSingle();

    if (data) {
      heading = "You're unsubscribed";
      message = "You'll no longer receive construction updates for this project.";
    } else {
      heading = "Already unsubscribed";
      message = "This link has already been used or has expired.";
    }
  }

  return new NextResponse(
    `<!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><title>${heading} — NeopolisNews</title></head>
      <body style="margin:0;background:#f9fafb;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:48px;max-width:420px;text-align:center;">
          <h1 style="margin:0 0 8px;font-size:20px;color:#111827;">${heading}</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">${message}</p>
          <a href="/" style="color:#1d4ed8;font-size:14px;font-weight:600;text-decoration:none;">← Back to NeopolisNews</a>
        </div>
      </body>
    </html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
