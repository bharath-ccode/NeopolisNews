import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/server";

const TTL_24H = 24 * 60 * 60 * 1000;

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await req.json().catch(() => null);
  const { email } = body ?? {};

  if (!email?.trim() || !email.includes("@")) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: biz } = await supabase
    .from("businesses")
    .select("id, name, owner_email, status")
    .eq("id", id)
    .single();

  if (!biz) {
    return NextResponse.json({ error: "Business not found." }, { status: 404 });
  }
  if (biz.status === "active") {
    return NextResponse.json({ error: "This business has already been claimed." }, { status: 409 });
  }
  if (biz.status !== "verified") {
    return NextResponse.json({ error: "This business is not yet approved for claiming." }, { status: 400 });
  }
  if (!biz.owner_email || biz.owner_email.toLowerCase() !== email.trim().toLowerCase()) {
    return NextResponse.json(
      { error: "The email address you entered does not match our records for this business." },
      { status: 400 }
    );
  }

  const claimToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TTL_24H).toISOString();

  await supabase
    .from("businesses")
    .update({ claim_token: claimToken, claim_token_expires_at: expiresAt })
    .eq("id", id);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neopolis.news";
  const claimUrl = `${baseUrl}/businesses/${id}/claim?token=${claimToken}`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error: emailErr } = await resend.emails.send({
    from: "no-reply@neopolis.news",
    to: biz.owner_email,
    subject: `New claim link for "${biz.name}" on NeopolisNews`,
    html: `
      <!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
          <tr><td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:40px;">
              <tr><td>
                <p style="margin:0 0 4px;font-size:13px;color:#6b7280;text-transform:uppercase;font-weight:600;">NeopolisNews</p>
                <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#111827;">New claim link for ${biz.name}</h1>
                <p style="margin:0 0 20px;font-size:14px;color:#374151;">
                  You requested a new link to claim your business listing. Click below to continue.
                </p>
                <div style="text-align:center;margin-bottom:24px;">
                  <a href="${claimUrl}" style="display:inline-block;background:#4338ca;color:#fff;font-weight:700;font-size:15px;text-decoration:none;padding:14px 32px;border-radius:10px;">
                    Claim Your Business
                  </a>
                </div>
                <p style="margin:0;font-size:13px;color:#6b7280;">
                  This link is valid for <strong>24 hours</strong>. If you did not request this, ignore this email.
                </p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>`,
  });

  if (emailErr) {
    return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
