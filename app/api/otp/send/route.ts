import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const TTL_MS = 10 * 60 * 1000; // 10 minutes

function sign(data: string): string {
  const secret = process.env.OTP_SECRET;
  if (!secret) throw new Error("OTP_SECRET env var is not set.");
  return createHmac("sha256", secret).update(data).digest("hex");
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { businessId, email, businessName } = body ?? {};

  if (!businessId || !email) {
    return NextResponse.json({ error: "Missing businessId or email." }, { status: 400 });
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = Date.now() + TTL_MS;
  const payload = `${businessId}|${otp}|${expiresAt}`;
  const token = `${payload}|${sign(payload)}`;

  const { error } = await resend.emails.send({
    from: "no-reply@neopolis.news",
    to: email,
    subject: `${otp} is your NeopolisNews verification code`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
            <tr><td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:40px;">
                <tr><td>
                  <p style="margin:0 0 4px;font-size:13px;color:#6b7280;letter-spacing:0.05em;text-transform:uppercase;font-weight:600;">
                    NeopolisNews
                  </p>
                  <h1 style="margin:0 0 24px;font-size:22px;font-weight:800;color:#111827;">
                    Your verification code
                  </h1>
                  ${businessName ? `<p style="margin:0 0 20px;font-size:14px;color:#374151;">Use this code to claim your listing for <strong>${businessName}</strong> on NeopolisNews.</p>` : ""}
                  <div style="background:#f0f4ff;border:1px solid #c7d2fe;border-radius:10px;padding:20px;text-align:center;margin-bottom:24px;">
                    <span style="font-size:36px;font-weight:900;letter-spacing:0.25em;color:#4338ca;font-family:monospace;">
                      ${otp}
                    </span>
                  </div>
                  <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">
                    This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
                  </p>
                  <p style="margin:0;font-size:12px;color:#9ca3af;">
                    If you did not request this, you can safely ignore this email.
                  </p>
                </td></tr>
              </table>
              <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">
                &copy; NeopolisNews &middot; Neopolis, Hyderabad
              </p>
            </td></tr>
          </table>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("[otp/send] Resend error:", error);
    return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 502 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("otp_pending", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 600, // 10 minutes
    path: "/",
  });
  return res;
}
