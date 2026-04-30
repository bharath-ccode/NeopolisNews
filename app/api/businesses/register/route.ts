import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/server";
import { generateOtp, setOtpCookie, otpEmailHtml } from "@/lib/otp";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { name, industry, types, subtypes, address, ownerEmail, ownerPhone } = body ?? {};

  if (!name || !industry || !types?.length || !address || !ownerEmail || !ownerPhone) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const id = Math.random().toString(36).slice(2, 10).toUpperCase();

  const supabase = createAdminClient();
  const { error: insertError } = await supabase.from("businesses").insert({
    id,
    name,
    industry,
    types,
    subtypes: subtypes ?? [],
    address,
    status: "invited",
    created_at: new Date().toISOString(),
    verified: false,
    owner_email: ownerEmail,
    owner_phone: ownerPhone,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const { otp, token } = generateOtp(id);

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error: emailError } = await resend.emails.send({
    from: "no-reply@neopolis.news",
    to: ownerEmail,
    subject: `${otp} is your Neopolis News verification code`,
    html: otpEmailHtml({
      headline: "Verify your business",
      bodyLine: `Use this code to verify and publish <strong>${name}</strong> on Neopolis News.`,
      otp,
    }),
  });

  if (emailError) {
    await supabase.from("businesses").delete().eq("id", id);
    return NextResponse.json({ error: "Failed to send verification email." }, { status: 502 });
  }

  const res = NextResponse.json({ id, name });
  setOtpCookie(res, token);
  return res;
}
