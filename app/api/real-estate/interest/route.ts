import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rateLimit";
import { LOCALITIES } from "@/lib/projectsStore";

const PROPERTY_TYPES = ["apartment", "villa"] as const;
const TIERS = ["affordable", "premium", "luxury", "uber_luxury"] as const;

const TIER_LABELS: Record<string, string> = {
  affordable: "Affordable",
  premium: "Premium",
  luxury: "Luxury",
  uber_luxury: "Uber Luxury",
};

/** POST { name, phone, email?, propertyType, bedrooms, areas[], tiers[] } —
 *  "Express Interest" on /real-estate. Buyers actively shopping for a home,
 *  captured before any specific project exists for them to enquire about —
 *  structured enough (property type, bedrooms, up to 3 areas, price tiers)
 *  that it gets its own table rather than the generic LeadForm path. */
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "buyer-interest", { limit: 10 });
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const { name, phone, email, propertyType, bedrooms, areas, tiers } = body ?? {};

  if (!name?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: "Name and phone are required." }, { status: 400 });
  }
  if (!PROPERTY_TYPES.includes(propertyType)) {
    return NextResponse.json({ error: "Select apartment or villa." }, { status: 400 });
  }
  const bedroomsNum = Number(bedrooms);
  if (!Number.isInteger(bedroomsNum) || bedroomsNum < 1 || bedroomsNum > 10) {
    return NextResponse.json({ error: "Select a bedroom count from 1 to 10." }, { status: 400 });
  }
  if (!Array.isArray(areas) || areas.length === 0 || areas.length > 3 || !areas.every((a) => LOCALITIES.includes(a))) {
    return NextResponse.json({ error: "Select 1 to 3 areas." }, { status: 400 });
  }
  const tiersList = Array.isArray(tiers) ? tiers.filter((t) => TIERS.includes(t)) : [];

  const admin = createAdminClient();
  const { error } = await admin.from("buyer_interests").insert({
    name: name.trim(),
    phone: phone.trim(),
    email: email?.trim() || null,
    property_type: propertyType,
    bedrooms: bedroomsNum,
    areas,
    tiers: tiersList,
  });
  if (error) return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });

  const toEmail = process.env.ADMIN_EMAIL;
  if (toEmail) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "NeopolisNews <no-reply@neopolis.news>",
      to: toEmail,
      subject: `New buyer interest — NeopolisNews Real Estate`,
      html: buildInterestEmail({
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        propertyType,
        bedrooms: bedroomsNum,
        areas,
        tiers: tiersList,
      }),
    }).catch(() => null);
  }

  return NextResponse.json({ ok: true });
}

function buildInterestEmail(p: {
  name: string;
  phone: string;
  email: string | null;
  propertyType: string;
  bedrooms: number;
  areas: string[];
  tiers: string[];
}) {
  const row = (label: string, value: string, shade: "a" | "b") => `<tr>
        <td style="padding:10px 14px;background:${shade === "a" ? "#f3f4f6" : "#fafafa"};font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;width:110px">${label}</td>
        <td style="padding:10px 14px;background:${shade === "a" ? "#f3f4f6" : "#fafafa"};font-size:14px;color:#111827">${value}</td>
      </tr>`;
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:0;">
<div style="max-width:520px;margin:40px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)">
  <div style="background:#0f2a4a;padding:24px 32px">
    <p style="color:#7eb3e8;font-size:11px;margin:0 0 4px;text-transform:uppercase;letter-spacing:.05em">NeopolisNews — Real Estate</p>
    <h1 style="color:white;margin:0;font-size:18px">New buyer interest</h1>
  </div>
  <div style="padding:32px">
    <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;margin-bottom:24px">
      ${row("Name", p.name, "a")}
      ${row("Phone", p.phone, "b")}
      ${p.email ? row("Email", p.email, "a") : ""}
      ${row("Looking for", `${p.propertyType === "apartment" ? "Apartment" : "Villa"} · ${p.bedrooms} BHK`, "b")}
      ${row("Areas", p.areas.join(", "), "a")}
      ${p.tiers.length ? row("Budget tier", p.tiers.map((t) => TIER_LABELS[t] ?? t).join(", "), "b") : ""}
    </table>
    <p style="font-size:12px;color:#9ca3af;margin:0">Submitted via <a href="https://neopolis.news" style="color:#2563eb">NeopolisNews</a></p>
  </div>
</div>
</body></html>`;
}
