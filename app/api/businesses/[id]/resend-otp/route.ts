import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/server";
import { generateOtp, setOtpCookie, otpEmailHtml } from "@/lib/otp";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const supabase = createAdminClient();

  const { data: biz } = await supabase
    .from("businesses")
    .select("id, name, owner_email, status")
    .eq("id", id)
    .single();

  if (!biz?.owner_email) {
    return NextResponse.json({ error: "Business or owner email not found." }, { status: 404 });
  }
  if (biz.status === "active") {
    return NextResponse.json({ error: "This business is already active." }, { status: 409 });
  }

  const { otp, token } = generateOtp(id);

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error: emailErr } = await resend.emails.send({
    from: "no-reply@neopolis.news",
    to: biz.owner_email,
    subject: `${otp} is your new Neopolis News verification code`,
    html: otpEmailHtml({
      headline: "New verification code",
      bodyLine: `Use this code to verify <strong>${biz.name}</strong>.`,
      otp,
    }),
  });

  if (emailErr) {
    return NextResponse.json({ error: "Failed to send verification email." }, { status: 502 });
  }

  const res = NextResponse.json({ ok: true });
  setOtpCookie(res, token);
  return res;
}
