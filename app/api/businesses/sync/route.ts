import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { BusinessRecord } from "@/lib/businessStore";

export async function POST(req: NextRequest) {
  try {
    const business: BusinessRecord = await req.json();
    if (!business?.id) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("businesses").upsert(
      {
        id:            business.id,
        name:          business.name,
        industry:      business.industry,
        types:         business.types,
        subtypes:      business.subtypes,
        address:       business.address,
        status:        business.status,
        created_at:    business.createdAt,
        verified:      business.verified ?? false,
        logo:          business.logo ?? null,
        pictures:      business.pictures ?? [],
        social_links:  business.socialLinks ?? {},
        contact_phone: business.contactPhone ?? null,
        description:   business.description ?? null,
        timings:       business.timings ?? [],
        completed_at:  business.completedAt ?? null,
        owner_email:   business.email ?? null,
        owner_phone:   business.ownerPhone ?? null,
      },
      { onConflict: "id" }
    );

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
