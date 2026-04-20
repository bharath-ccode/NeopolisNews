import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { name, phone, email, message, purpose } = body ?? {};

  if (!name?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: "Name and phone are required." }, { status: 400 });
  }

  const toEmail = process.env.ADMIN_EMAIL;
  if (!toEmail) return NextResponse.json({ ok: true }); // silently succeed if no admin email configured

  const purposeLabel: Record<string, string> = {
    "advertise-sales":  "Advertise / Sales Enquiry",
    "business-directory": "Business Directory Registration",
    "general": "General Enquiry",
  };

  await resend.emails.send({
    from: "NeopolisNews <no-reply@neopolis.news>",
    to: toEmail,
    subject: `New lead: ${purposeLabel[purpose] ?? purpose ?? "General"} — NeopolisNews`,
    html: buildLeadEmail({ name, phone, email, message, purpose: purposeLabel[purpose] ?? purpose ?? "General" }),
  });

  return NextResponse.json({ ok: true });
}

function buildLeadEmail(p: {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  purpose: string;
}) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:0;">
<div style="max-width:520px;margin:40px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)">
  <div style="background:#0f2a4a;padding:24px 32px">
    <p style="color:#7eb3e8;font-size:11px;margin:0 0 4px;text-transform:uppercase;letter-spacing:.05em">NeopolisNews — New Lead</p>
    <h1 style="color:white;margin:0;font-size:18px">${p.purpose}</h1>
  </div>
  <div style="padding:32px">
    <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;margin-bottom:24px">
      <tr>
        <td style="padding:10px 14px;background:#f3f4f6;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;width:90px">Name</td>
        <td style="padding:10px 14px;background:#f3f4f6;font-size:14px;color:#111827">${p.name}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;background:#fafafa;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase">Phone</td>
        <td style="padding:10px 14px;background:#fafafa;font-size:14px;color:#111827">${p.phone}</td>
      </tr>
      ${p.email ? `<tr>
        <td style="padding:10px 14px;background:#f3f4f6;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase">Email</td>
        <td style="padding:10px 14px;background:#f3f4f6;font-size:14px;color:#111827">${p.email}</td>
      </tr>` : ""}
      ${p.message ? `<tr>
        <td style="padding:10px 14px;background:#fafafa;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;vertical-align:top">Message</td>
        <td style="padding:10px 14px;background:#fafafa;font-size:14px;color:#111827;line-height:1.6">${p.message.replace(/\n/g, "<br>")}</td>
      </tr>` : ""}
    </table>
    <p style="font-size:12px;color:#9ca3af;margin:0">Submitted via <a href="https://neopolis.news" style="color:#2563eb">NeopolisNews</a></p>
  </div>
</div>
</body></html>`;
}
