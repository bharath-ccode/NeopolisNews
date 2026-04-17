import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/server";

const TTL_MS = 10 * 60 * 1000;

function sign(data: string): string {
  const secret = process.env.OTP_SECRET;
  if (!secret) throw new Error("OTP_SECRET env var is not set.");
  return createHmac("sha256", secret).update(data).digest("hex");
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const supabase = createAdminClient();

  const { data: biz } = await supabase
    .from("businesses")
    .select("id, name, owner_email, status")
    .eq("id", id)
    .single();

  if (!biz?.owner_email) {
    return NextResponse.json({ error: "Business or owner email not found." }, { status: 404 });
  }
  if (biz.status === "active") {
    return NextResponse.json({ error: "This business is already active." }, { status: 409 });
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = Date.now() + TTL_MS;
  const payload = `${id}|${otp}|${expiresAt}`;
  const token = `${payload}|${sign(payload)}`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error: emailErr } = await resend.emails.send({
    from: "no-reply@neopolis.news",
    to: biz.owner_email,
    subject: `${otp} is your new NeopolisNews verification code`,
    html: `
      <!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
          <tr><td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:40px;">
              <tr><td>
                <p style="margin:0 0 4px;font-size:13px;color:#6b7280;text-transform:uppercase;font-weight:600;">NeopolisNews</p>
                <h1 style="margin:0 0 24px;font-size:22px;font-weight:800;color:#111827;">New verification code</h1>
                <p style="margin:0 0 20px;font-size:14px;color:#374151;">Use this code to verify <strong>${biz.name}</strong>.</p>
                <div style="background:#f0f4ff;border:1px solid #c7d2fe;border-radius:10px;padding:20px;text-align:center;margin-bottom:24px;">
                  <span style="font-size:36px;font-weight:900;letter-spacing:0.25em;color:#4338ca;font-family:monospace;">${otp}</span>
                </div>
                <p style="margin:0;font-size:13px;color:#6b7280;">Expires in <strong>10 minutes</strong>. Do not share it.</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>`,
  });

  if (emailErr) {
    return NextResponse.json({ error: "Failed to send verification email." }, { status: 502 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("otp_pending", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 600,
    path: "/",
  });
  return res;
}
