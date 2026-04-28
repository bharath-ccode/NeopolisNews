import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/server";

const TTL_24H = 24 * 60 * 60 * 1000;

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const supabase = createAdminClient();

  // Fetch business
  const { data: biz, error: bizErr } = await supabase
    .from("businesses")
    .select("id, name, status")
    .eq("id", id)
    .single();

  if (bizErr || !biz) {
    return NextResponse.json({ error: "Business not found." }, { status: 404 });
  }
  if (biz.status !== "pending") {
    return NextResponse.json({ error: "No pending verification request for this business." }, { status: 400 });
  }

  // Fetch the pending verification request
  const { data: vr, error: vrErr } = await supabase
    .from("verification_requests")
    .select("id, submitter_name, submitter_email, submitter_phone")
    .eq("business_id", id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (vrErr || !vr) {
    return NextResponse.json({ error: "Verification request not found." }, { status: 404 });
  }

  // Generate a secure 24-hour claim token
  const claimToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TTL_24H).toISOString();

  // Update business with owner details + claim token + status "verified"
  const { error: updateErr } = await supabase
    .from("businesses")
    .update({
      owner_email: vr.submitter_email,
      owner_phone: vr.submitter_phone,
      claim_token: claimToken,
      claim_token_expires_at: expiresAt,
      status: "verified",
    })
    .eq("id", id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // Mark verification request as approved
  await supabase
    .from("verification_requests")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", vr.id);

  // Send claim email
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://neopolis.news";
  const claimUrl = `${baseUrl}/businesses/${id}/claim?token=${claimToken}`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error: emailErr } = await resend.emails.send({
    from: "no-reply@neopolis.news",
    to: vr.submitter_email,
    subject: `Your business listing "${biz.name}" is ready to claim`,
    html: `
      <!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
          <tr><td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:40px;">
              <tr><td>
                <p style="margin:0 0 4px;font-size:13px;color:#6b7280;text-transform:uppercase;font-weight:600;letter-spacing:0.05em;">NeopolisNews</p>
                <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#111827;">Your listing is verified!</h1>
                <p style="margin:0 0 20px;font-size:14px;color:#374151;">
                  Hi ${vr.submitter_name},<br/><br/>
                  We've verified your request for <strong>${biz.name}</strong>. Click the button below to complete your profile and go live on NeopolisNews.
                </p>
                <div style="text-align:center;margin-bottom:24px;">
                  <a href="${claimUrl}" style="display:inline-block;background:#4338ca;color:#fff;font-weight:700;font-size:15px;text-decoration:none;padding:14px 32px;border-radius:10px;">
                    Claim Your Business
                  </a>
                </div>
                <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">
                  This link is valid for <strong>24 hours</strong>. If it expires, you can request a new one from the business profile page.
                </p>
                <p style="margin:0;font-size:12px;color:#9ca3af;">If you didn't submit this request, you can ignore this email.</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>`,
  });

  if (emailErr) {
    return NextResponse.json({ error: "Approved but failed to send email." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, sentTo: vr.submitter_email });
}
