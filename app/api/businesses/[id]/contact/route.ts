import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { Resend } from "resend";



export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const body = await req.json().catch(() => null);
  const { senderName, senderPhone, message } = body ?? {};

  if (!senderName?.trim() || !senderPhone?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Name, phone, and message are required." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: biz } = await admin
    .from("businesses")
    .select("name, owner_email")
    .eq("id", params.id)
    .single();

  if (!biz) return NextResponse.json({ error: "Business not found." }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toEmail: string | undefined = (biz as any).owner_email ?? process.env.ADMIN_EMAIL;
  if (!toEmail) return NextResponse.json({ error: "Unable to deliver message." }, { status: 500 });

  await Promise.all([
    admin.from("business_enquiries").insert({
      business_id: params.id,
      sender_name: senderName.trim(),
      sender_phone: senderPhone.trim(),
      message: message.trim(),
    }),
    resend.emails.send({
      from: "NeopolisNews <no-reply@neopolis.news>",
      to: toEmail,
      subject: `New message for ${biz.name} — NeopolisNews`,
      html: buildContactEmail({ businessName: biz.name, senderName, senderPhone, message }),
    }),
  ]);

  return NextResponse.json({ ok: true });
}

function buildContactEmail(p: {
  businessName: string;
  senderName: string;
  senderPhone: string;
  message: string;
}) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:0;">
<div style="max-width:520px;margin:40px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)">
  <div style="background:#0f2a4a;padding:24px 32px">
    <p style="color:#7eb3e8;font-size:11px;margin:0 0 4px;text-transform:uppercase;letter-spacing:.05em">NeopolisNews</p>
    <h1 style="color:white;margin:0;font-size:18px">New customer message</h1>
  </div>
  <div style="padding:32px">
    <p style="margin:0 0 20px;color:#374151;font-size:14px">
      Someone contacted <strong>${p.businessName}</strong> through your NeopolisNews listing.
    </p>
    <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;margin-bottom:24px">
      <tr>
        <td style="padding:10px 14px;background:#f3f4f6;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;width:90px">Name</td>
        <td style="padding:10px 14px;background:#f3f4f6;font-size:14px;color:#111827">${p.senderName}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;background:#fafafa;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase">Phone</td>
        <td style="padding:10px 14px;background:#fafafa;font-size:14px;color:#111827">${p.senderPhone}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;background:#f3f4f6;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;vertical-align:top">Message</td>
        <td style="padding:10px 14px;background:#f3f4f6;font-size:14px;color:#111827;line-height:1.6">${p.message.replace(/\n/g, "<br>")}</td>
      </tr>
    </table>
    <p style="font-size:12px;color:#9ca3af;margin:0">Sent via <a href="https://neopolis.news" style="color:#2563eb">NeopolisNews</a></p>
  </div>
</div>
</body></html>`;
}
