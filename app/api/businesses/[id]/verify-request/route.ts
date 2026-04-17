import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await req.json().catch(() => null);
  const { name, email, phone, proofUrl } = body ?? {};

  if (!name?.trim() || !email?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: "Name, email, and phone are required." }, { status: 400 });
  }
  if (!email.includes("@")) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Confirm business exists and hasn't been claimed
  const { data: biz, error: bizErr } = await supabase
    .from("businesses")
    .select("id, status, owner_email")
    .eq("id", id)
    .single();

  if (bizErr || !biz) {
    return NextResponse.json({ error: "Business not found." }, { status: 404 });
  }
  if (biz.status === "active") {
    return NextResponse.json({ error: "This business has already been claimed." }, { status: 409 });
  }
  if (biz.status === "pending") {
    return NextResponse.json({ error: "A verification request is already pending for this business." }, { status: 409 });
  }
  if (biz.owner_email) {
    return NextResponse.json({ error: "This business already has owner details on file. Use the standard claim flow." }, { status: 409 });
  }

  // Insert verification request
  const { error: insertErr } = await supabase
    .from("verification_requests")
    .insert({
      business_id: id,
      submitter_name: name.trim(),
      submitter_email: email.trim().toLowerCase(),
      submitter_phone: phone.trim(),
      proof_url: proofUrl ?? null,
      status: "pending",
    });

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // Update business status to pending
  await supabase.from("businesses").update({ status: "pending" }).eq("id", id);

  // Notify admin
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neopolis.news";
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "no-reply@neopolis.news",
      to: adminEmail,
      subject: `New ownership request for "${biz.id}" on NeopolisNews`,
      html: `
        <!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
            <tr><td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:40px;">
                <tr><td>
                  <p style="margin:0 0 4px;font-size:13px;color:#6b7280;text-transform:uppercase;font-weight:600;">NeopolisNews Admin</p>
                  <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#111827;">New Ownership Verification Request</h1>
                  <p style="margin:0 0 12px;font-size:14px;color:#374151;">
                    <strong>${name.trim()}</strong> has submitted an ownership claim request.
                  </p>
                  <table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;color:#374151;margin-bottom:20px;">
                    <tr><td style="padding:4px 0;color:#6b7280;width:100px;">Name</td><td style="padding:4px 0;font-weight:600;">${name.trim()}</td></tr>
                    <tr><td style="padding:4px 0;color:#6b7280;">Email</td><td style="padding:4px 0;">${email.trim()}</td></tr>
                    <tr><td style="padding:4px 0;color:#6b7280;">Phone</td><td style="padding:4px 0;">${phone.trim()}</td></tr>
                  </table>
                  <div style="text-align:center;margin-bottom:16px;">
                    <a href="${baseUrl}/admin/businesses/${id}" style="display:inline-block;background:#d97706;color:#fff;font-weight:700;font-size:15px;text-decoration:none;padding:14px 32px;border-radius:10px;">
                      Review Request
                    </a>
                  </div>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body></html>`,
    }).catch(() => {}); // non-critical
  }

  return NextResponse.json({ ok: true });
}
