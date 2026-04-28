import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/server";

// E.164: + followed by 7–15 digits, first digit of country code is 1-9
const E164_RE  = /^\+[1-9]\d{6,14}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json().catch(() => null);
  const { senderName, senderPhone, senderEmail, message } = (body ?? {}) as Record<string, string>;

  // ── Validate ─────────────────────────────────────────────────────────────────
  const errors: string[] = [];

  if (!senderName?.trim())
    errors.push("Name is required.");

  const phone = senderPhone?.trim() ?? "";
  if (!phone)
    errors.push("Phone number is required.");
  else if (!E164_RE.test(phone))
    errors.push("Phone must be in international format, e.g. +91 9900000000.");

  const email = senderEmail?.trim() ?? "";
  if (!email)
    errors.push("Email address is required.");
  else if (!EMAIL_RE.test(email))
    errors.push("Please enter a valid email address.");

  if (!message?.trim())
    errors.push("Message is required.");

  if (errors.length)
    return NextResponse.json({ error: errors[0] }, { status: 400 });

  // ── Fetch project ─────────────────────────────────────────────────────────────
  const admin = createAdminClient();
  const { data: project } = await admin
    .from("projects")
    .select("id, project_name, builder_id, contacts(email), builders(email)")
    .eq("id", params.id)
    .single();

  if (!project)
    return NextResponse.json({ error: "Project not found." }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contact = Array.isArray((project as any).contacts) ? (project as any).contacts[0] : (project as any).contacts;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const builder = Array.isArray((project as any).builders) ? (project as any).builders[0] : (project as any).builders;

  const toEmail: string =
    contact?.email ?? builder?.email ?? process.env.ADMIN_EMAIL ?? "";

  if (!toEmail)
    return NextResponse.json({ error: "Unable to deliver enquiry — no contact email on file." }, { status: 500 });

  // ── Persist + send email (best-effort, non-blocking) ─────────────────────────
  await Promise.allSettled([
    admin.from("project_enquiries").insert({
      project_id:   params.id,
      sender_name:  senderName.trim(),
      sender_phone: phone,
      sender_email: email,
      message:      message.trim(),
    }),
    new Resend(process.env.RESEND_API_KEY).emails.send({
      from:    "NeopolisNews <no-reply@neopolis.news>",
      to:      toEmail,
      replyTo: email,
      subject: `New enquiry for ${project.project_name} — NeopolisNews`,
      html:    buildEmail({
        projectName: project.project_name,
        senderName:  senderName.trim(),
        senderPhone: phone,
        senderEmail: email,
        message:     message.trim(),
      }),
    }),
  ]);

  return NextResponse.json({ ok: true });
}

function buildEmail(p: {
  projectName: string;
  senderName:  string;
  senderPhone: string;
  senderEmail: string;
  message:     string;
}) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:0;">
<div style="max-width:540px;margin:40px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)">
  <div style="background:#0f2a4a;padding:24px 32px">
    <p style="color:#7eb3e8;font-size:11px;margin:0 0 4px;text-transform:uppercase;letter-spacing:.06em">NeopolisNews · Project Enquiry</p>
    <h1 style="color:white;margin:0;font-size:20px;font-weight:800">${p.projectName}</h1>
  </div>
  <div style="padding:32px">
    <p style="margin:0 0 20px;color:#374151;font-size:14px;line-height:1.6">
      A potential buyer has submitted an enquiry for <strong>${p.projectName}</strong>.
      You can reply directly to this email to reach them.
    </p>
    <table style="width:100%;border-collapse:collapse;border-radius:10px;overflow:hidden;margin-bottom:24px;font-size:14px">
      <tr>
        <td style="padding:11px 16px;background:#f3f4f6;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;width:80px">Name</td>
        <td style="padding:11px 16px;background:#f3f4f6;color:#111827;font-weight:600">${p.senderName}</td>
      </tr>
      <tr>
        <td style="padding:11px 16px;background:#fafafa;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.04em">Phone</td>
        <td style="padding:11px 16px;background:#fafafa;color:#111827">
          <a href="tel:${p.senderPhone}" style="color:#1d4ed8;text-decoration:none;font-weight:600">${p.senderPhone}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:11px 16px;background:#f3f4f6;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.04em">Email</td>
        <td style="padding:11px 16px;background:#f3f4f6;color:#111827">
          <a href="mailto:${p.senderEmail}" style="color:#1d4ed8;text-decoration:none">${p.senderEmail}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:11px 16px;background:#fafafa;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;vertical-align:top">Message</td>
        <td style="padding:11px 16px;background:#fafafa;color:#374151;line-height:1.7">${p.message.replace(/\n/g, "<br>")}</td>
      </tr>
    </table>
    <p style="font-size:12px;color:#9ca3af;margin:0">
      Sent via <a href="https://neopolis.news" style="color:#2563eb;text-decoration:none">NeopolisNews</a> ·
      Reply to this email to respond directly to ${p.senderName}.
    </p>
  </div>
</div>
</body></html>`;
}
