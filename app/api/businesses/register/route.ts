import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/server";
import { generateOtp, setOtpCookie, otpEmailHtml } from "@/lib/otp";
import { geocodeAddress } from "@/lib/googleGeocode";
import { findPlaceMatch } from "@/lib/businessDedup";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { name, industry, types, subtypes, address, ownerEmail, ownerPhone, declinedPlaceId } = body ?? {};

  if (!name || !industry || !types?.length || !address || !ownerEmail || !ownerPhone) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  // Same physical place may already be listed via Google-sourced discovery
  // (unclaimed) — don't create a second row for it, point the submitter at
  // claiming the existing one instead.
  const match = await findPlaceMatch(name, address);
  if (match?.existingBusiness) {
    const existing = match.existingBusiness;
    if (!existing.owner_id) {
      return NextResponse.json(
        {
          error: `${existing.name} is already listed on NeopolisNews — claim it instead of creating a new listing.`,
          duplicate: { businessId: existing.id, businessName: existing.name, claimed: false },
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      {
        error: `${existing.name} already appears to be listed and claimed on NeopolisNews. If this is your business, contact support@neopolis.news.`,
        duplicate: { businessId: existing.id, businessName: existing.name, claimed: true },
      },
      { status: 409 }
    );
  }

  const id = Math.random().toString(36).slice(2, 10).toUpperCase();
  const coords = await geocodeAddress(address);

  // The owner already saw this exact Google match at the info step and said
  // "that's not us" — respect it instead of silently re-adopting the same
  // guess. (The existingBusiness block above still runs regardless, since
  // that's a real conflict to flag no matter what they said about identity.)
  const placeId = match?.placeId && match.placeId !== declinedPlaceId ? match.placeId : null;

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
    latitude: coords?.lat ?? null,
    longitude: coords?.lng ?? null,
    place_id: placeId,
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
