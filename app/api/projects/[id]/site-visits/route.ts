import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit } from "@/lib/rateLimit";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const SLOTS = ["morning", "afternoon", "evening"] as const;
const SLOT_LABELS: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

/** POST — book a site visit for a project (public). */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const limited = rateLimit(req, "site-visits", { limit: 3 });
  if (limited) return limited;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { visitor_name, visitor_phone, preferred_date, preferred_slot, note, user_id } = body as {
    visitor_name?: string; visitor_phone?: string; preferred_date?: string;
    preferred_slot?: string; note?: string; user_id?: string;
  };

  if (!visitor_name?.trim())  return NextResponse.json({ error: "Please enter your name." },        { status: 400 });
  if (!visitor_phone?.trim()) return NextResponse.json({ error: "Please enter your phone number." },{ status: 400 });
  if (!preferred_date)        return NextResponse.json({ error: "Please pick a date." },            { status: 400 });
  if (!preferred_slot || !SLOTS.includes(preferred_slot as (typeof SLOTS)[number]))
    return NextResponse.json({ error: "Please pick a time slot." }, { status: 400 });

  const date = new Date(preferred_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (isNaN(date.getTime()) || date < today)
    return NextResponse.json({ error: "Please pick a date from tomorrow onwards." }, { status: 400 });

  const admin = createAdminClient();

  const { data: project } = await admin
    .from("projects")
    .select("id, project_name, contacts(email), builders(email)")
    .eq("id", params.id)
    .single();
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const { data, error } = await admin
    .from("site_visit_bookings")
    .insert({
      project_id:     params.id,
      user_id:        user_id ?? null,
      visitor_name:   visitor_name.trim(),
      visitor_phone:  visitor_phone.trim(),
      preferred_date,
      preferred_slot,
      note:           note?.trim() || null,
    })
    .select("id, preferred_date, preferred_slot, status")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contact = Array.isArray((project as any).contacts) ? (project as any).contacts[0] : (project as any).contacts;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const builder = Array.isArray((project as any).builders) ? (project as any).builders[0] : (project as any).builders;
  const toEmail: string = contact?.email ?? builder?.email ?? process.env.ADMIN_EMAIL ?? "";

  if (toEmail && process.env.RESEND_API_KEY) {
    new Resend(process.env.RESEND_API_KEY).emails.send({
      from: "NeopolisNews <no-reply@neopolis.news>",
      to: toEmail,
      subject: `New site visit request — ${project.project_name} — NeopolisNews`,
      html: buildEmail({
        projectName: project.project_name,
        visitorName: visitor_name.trim(),
        visitorPhone: visitor_phone.trim(),
        preferredDate: preferred_date,
        preferredSlot: SLOT_LABELS[preferred_slot] ?? preferred_slot,
        note: note?.trim() || null,
      }),
    }).catch(() => null); // best-effort — the booking is already saved regardless
  }

  return NextResponse.json(data, { status: 201 });
}

function buildEmail(p: {
  projectName: string;
  visitorName: string;
  visitorPhone: string;
  preferredDate: string;
  preferredSlot: string;
  note: string | null;
}) {
  const dateLabel = new Date(p.preferredDate).toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:0;">
<div style="max-width:540px;margin:40px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)">
  <div style="background:#0f2a4a;padding:24px 32px">
    <p style="color:#7eb3e8;font-size:11px;margin:0 0 4px;text-transform:uppercase;letter-spacing:.06em">NeopolisNews · Site Visit Request</p>
    <h1 style="color:white;margin:0;font-size:20px;font-weight:800">${p.projectName}</h1>
  </div>
  <div style="padding:32px">
    <p style="margin:0 0 20px;color:#374151;font-size:14px;line-height:1.6">
      A potential buyer wants to visit <strong>${p.projectName}</strong>. Call them to confirm the slot.
    </p>
    <table style="width:100%;border-collapse:collapse;border-radius:10px;overflow:hidden;margin-bottom:24px;font-size:14px">
      <tr>
        <td style="padding:11px 16px;background:#f3f4f6;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;width:90px">Name</td>
        <td style="padding:11px 16px;background:#f3f4f6;color:#111827;font-weight:600">${p.visitorName}</td>
      </tr>
      <tr>
        <td style="padding:11px 16px;background:#fafafa;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.04em">Phone</td>
        <td style="padding:11px 16px;background:#fafafa;color:#111827">
          <a href="tel:${p.visitorPhone}" style="color:#1d4ed8;text-decoration:none;font-weight:600">${p.visitorPhone}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:11px 16px;background:#f3f4f6;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.04em">Preferred Date</td>
        <td style="padding:11px 16px;background:#f3f4f6;color:#111827;font-weight:600">${dateLabel}</td>
      </tr>
      <tr>
        <td style="padding:11px 16px;background:#fafafa;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.04em">Preferred Time</td>
        <td style="padding:11px 16px;background:#fafafa;color:#111827;font-weight:600">${p.preferredSlot}</td>
      </tr>
      ${p.note ? `<tr>
        <td style="padding:11px 16px;background:#f3f4f6;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;vertical-align:top">Note</td>
        <td style="padding:11px 16px;background:#f3f4f6;color:#374151;line-height:1.7">${p.note.replace(/\n/g, "<br>")}</td>
      </tr>` : ""}
    </table>
    <p style="font-size:12px;color:#9ca3af;margin:0">
      Sent via <a href="https://neopolis.news" style="color:#2563eb;text-decoration:none">NeopolisNews</a> ·
      Manage all your site visit requests at <a href="https://neopolis.news/builder/site-visits" style="color:#2563eb;text-decoration:none">neopolis.news/builder/site-visits</a>
    </p>
  </div>
</div>
</body></html>`;
}
