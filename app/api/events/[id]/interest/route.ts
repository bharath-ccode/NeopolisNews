import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rateLimit";

/** POST { senderName, senderPhone, senderEmail } — "I'm Interested" on a
 *  paid event. No payment integration exists yet, so this doesn't claim a
 *  slot or take money: it records an enquiry against the event's business
 *  and emails the organiser the visitor's contact details, same as the
 *  business profile's "Send Message" form. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const limited = rateLimit(req, "event-interest", { limit: 10 });
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const { senderName, senderPhone, senderEmail } = body ?? {};

  if (!senderName?.trim() || !senderPhone?.trim() || !senderEmail?.trim()) {
    return NextResponse.json({ error: "Name, phone, and email are required." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: event } = await admin
    .from("business_events")
    .select("id, name, event_date, ticket_price, business_id, businesses(name, owner_email)")
    .eq("id", params.id)
    .maybeSingle();

  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const biz = (event as any).businesses as { name: string; owner_email: string | null } | null;
  const toEmail = biz?.owner_email ?? process.env.ADMIN_EMAIL;
  if (!toEmail) return NextResponse.json({ error: "Unable to deliver your interest right now." }, { status: 500 });

  const message = `Interested in "${event.name}" (₹${Number(event.ticket_price ?? 0).toLocaleString("en-IN")} ticket) — please share payment/booking details.`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  await Promise.all([
    admin.from("business_enquiries").insert({
      business_id: event.business_id,
      event_id: event.id,
      sender_name: senderName.trim(),
      sender_phone: senderPhone.trim(),
      sender_email: senderEmail.trim(),
      message,
    }),
    resend.emails.send({
      from: "NeopolisNews <no-reply@neopolis.news>",
      to: toEmail,
      subject: `New interest in "${event.name}" — NeopolisNews`,
      html: buildInterestEmail({
        businessName: biz?.name ?? "your business",
        eventName: event.name,
        ticketPrice: event.ticket_price,
        senderName,
        senderPhone,
        senderEmail,
      }),
    }),
  ]);

  return NextResponse.json({ ok: true });
}

function buildInterestEmail(p: {
  businessName: string;
  eventName: string;
  ticketPrice: number | null;
  senderName: string;
  senderPhone: string;
  senderEmail: string;
}) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:0;">
<div style="max-width:520px;margin:40px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)">
  <div style="background:#4c1d95;padding:24px 32px">
    <p style="color:#c4b5fd;font-size:11px;margin:0 0 4px;text-transform:uppercase;letter-spacing:.05em">NeopolisNews</p>
    <h1 style="color:white;margin:0;font-size:18px">New ticket interest</h1>
  </div>
  <div style="padding:32px">
    <p style="margin:0 0 20px;color:#374151;font-size:14px">
      Someone wants a ticket to <strong>${p.eventName}</strong>${p.ticketPrice ? ` (₹${Number(p.ticketPrice).toLocaleString("en-IN")})` : ""} — reach out to arrange payment and confirm their spot.
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
        <td style="padding:10px 14px;background:#f3f4f6;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase">Email</td>
        <td style="padding:10px 14px;background:#f3f4f6;font-size:14px;color:#111827">${p.senderEmail}</td>
      </tr>
    </table>
    <p style="font-size:12px;color:#9ca3af;margin:0">Sent via <a href="https://neopolis.news" style="color:#7c3aed">NeopolisNews</a></p>
  </div>
</div>
</body></html>`;
}
