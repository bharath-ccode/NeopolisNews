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
  const { data: listing } = await admin
    .from("classifieds")
    .select("id, owner_name, property_type, bedrooms, price, listing_type, project_name, standalone_description, is_standalone, broker_id, user_id, brokers:broker_id(email, name)")
    .eq("id", params.id)
    .single();

  if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });

  let toEmail: string | null = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const broker = listing.brokers as any;
  if (listing.broker_id && broker?.email) {
    toEmail = broker.email;
  } else if (listing.user_id) {
    const { data: { user } } = await admin.auth.admin.getUserById(listing.user_id);
    toEmail = user?.email ?? null;
  }

  if (!toEmail) toEmail = process.env.ADMIN_EMAIL ?? null;
  if (!toEmail) return NextResponse.json({ error: "Unable to deliver enquiry." }, { status: 500 });

  const listingTitle = listing.bedrooms
    ? `${listing.bedrooms} BHK ${listing.property_type}`
    : listing.property_type;
  const location = listing.is_standalone
    ? (listing.standalone_description ?? "Standalone property")
    : (listing.project_name ?? "Neopolis");

  await Promise.all([
    admin.from("enquiries").insert({
      classified_id: params.id,
      sender_name: senderName.trim(),
      sender_phone: senderPhone.trim(),
      message: message.trim(),
    }),
    resend.emails.send({
      from: "NeopolisNews <no-reply@neopolis.news>",
      to: toEmail,
      subject: `New enquiry on your ${listingTitle} listing — NeopolisNews`,
      html: buildEnquiryEmail({ ownerName: listing.owner_name, listingTitle, location, price: listing.price, listingType: listing.listing_type, senderName, senderPhone, message }),
    }),
  ]);

  return NextResponse.json({ ok: true });
}

function buildEnquiryEmail(p: {
  ownerName: string;
  listingTitle: string;
  location: string;
  price: string;
  listingType: string;
  senderName: string;
  senderPhone: string;
  message: string;
}) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:0;">
<div style="max-width:520px;margin:40px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)">
  <div style="background:#0f2a4a;padding:24px 32px">
    <p style="color:#7eb3e8;font-size:11px;margin:0 0 4px;text-transform:uppercase;letter-spacing:.05em">NeopolisNews — Property Enquiry</p>
    <h1 style="color:white;margin:0;font-size:18px">New enquiry on your listing</h1>
  </div>
  <div style="padding:32px">
    <p style="margin:0 0 16px;color:#374151;font-size:14px">Hi <strong>${p.ownerName}</strong>, someone is interested in your listing.</p>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px 16px;margin-bottom:20px">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#1e40af">${p.listingTitle} — For ${p.listingType === "rent" ? "Rent" : "Sale"}</p>
      <p style="margin:0 0 4px;font-size:12px;color:#3b82f6">${p.location}</p>
      <p style="margin:0;font-size:13px;font-weight:700;color:#1d4ed8">₹${p.price}${p.listingType === "rent" ? "/mo" : ""}</p>
    </div>
    <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;margin-bottom:24px">
      <tr>
        <td style="padding:10px 14px;background:#f3f4f6;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;width:90px">From</td>
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
