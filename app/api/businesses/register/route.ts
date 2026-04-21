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

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { name, industry, types, subtypes, address, ownerEmail, ownerPhone } = body ?? {};

  if (!name || !industry || !types?.length || !address || !ownerEmail || !ownerPhone) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const id = Math.random().toString(36).slice(2, 10).toUpperCase();

  const supabase = createAdminClient();
  const { error: insertError } = await supabase.from("businesses").insert({
    id,
    name,
    industry,
    types,
    subtypes: subtypes ?? [],
    address,
    status: "invited",
    created_at: new Date().toISOString(),
    verified: false,
    owner_email: ownerEmail,
    owner_phone: ownerPhone,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Generate OTP and send email
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = Date.now() + TTL_MS;
  const payload = `${id}|${otp}|${expiresAt}`;
  const token = `${payload}|${sign(payload)}`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error: emailError } = await resend.emails.send({
    from: "no-reply@neopolis.news",
    to: ownerEmail,
    subject: `${otp} is your NeopolisNews verification code`,
    html: `
      <!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
          <tr><td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:40px;">
              <tr><td>
                <p style="margin:0 0 4px;font-size:13px;color:#6b7280;letter-spacing:0.05em;text-transform:uppercase;font-weight:600;">NeopolisNews</p>
                <h1 style="margin:0 0 24px;font-size:22px;font-weight:800;color:#111827;">Verify your business</h1>
                <p style="margin:0 0 20px;font-size:14px;color:#374151;">Use this code to verify and publish <strong>${name}</strong> on NeopolisNews.</p>
                <div style="background:#f0f4ff;border:1px solid #c7d2fe;border-radius:10px;padding:20px;text-align:center;margin-bottom:24px;">
                  <span style="font-size:36px;font-weight:900;letter-spacing:0.25em;color:#4338ca;font-family:monospace;">${otp}</span>
                </div>
                <p style="margin:0;font-size:13px;color:#6b7280;">Expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>`,
  });

  if (emailError) {
    // Roll back the insert
    await supabase.from("businesses").delete().eq("id", id);
    return NextResponse.json({ error: "Failed to send verification email." }, { status: 502 });
  }

  const res = NextResponse.json({ id, name });
  res.cookies.set("otp_pending", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 600,
    path: "/",
  });
  return res;
}
