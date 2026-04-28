import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await req.json().catch(() => null);
  const { notes } = body ?? {};

  const supabase = createAdminClient();

  // Fetch the pending verification request
  const { data: vr } = await supabase
    .from("verification_requests")
    .select("id, submitter_name, submitter_email")
    .eq("business_id", id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!vr) {
    return NextResponse.json({ error: "No pending request found." }, { status: 404 });
  }

  // Mark request rejected
  await supabase
    .from("verification_requests")
    .update({ status: "rejected", notes: notes ?? null, reviewed_at: new Date().toISOString() })
    .eq("id", vr.id);

  // Reset business back to invited so another request can be submitted
  await supabase
    .from("businesses")
    .update({ status: "invited" })
    .eq("id", id);

  // Notify the submitter
  const { data: biz } = await supabase.from("businesses").select("name").eq("id", id).single();
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "no-reply@neopolis.news",
    to: vr.submitter_email,
    subject: `Update on your claim request for "${biz?.name ?? "your business"}"`,
    html: `
      <!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
          <tr><td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:40px;">
              <tr><td>
                <p style="margin:0 0 4px;font-size:13px;color:#6b7280;text-transform:uppercase;font-weight:600;">NeopolisNews</p>
                <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#111827;">Claim request update</h1>
                <p style="margin:0 0 16px;font-size:14px;color:#374151;">
                  Hi ${vr.submitter_name},<br/><br/>
                  We were unable to verify your ownership of <strong>${biz?.name ?? "the requested business"}</strong> at this time.
                  ${notes ? `<br/><br/><strong>Reason:</strong> ${notes}` : ""}
                </p>
                <p style="margin:0;font-size:13px;color:#6b7280;">
                  If you believe this is a mistake, please contact us with additional documentation.
                </p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>`,
  }).catch(() => {}); // non-critical — don't fail the rejection if email fails

  return NextResponse.json({ ok: true });
}
