import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  // Resolve broker record
  const { data: broker } = await admin
    .from("brokers")
    .select("id, status")
    .eq("auth_user_id", user.id)
    .single();

  if (!broker || broker.status !== "approved") {
    return NextResponse.json({ error: "Broker not approved" }, { status: 403 });
  }

  const { data, error } = await admin
    .from("classifieds")
    .select("*")
    .eq("broker_id", broker.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  // Resolve broker record — must be approved
  const { data: broker } = await admin
    .from("brokers")
    .select("id, status, name, phone")
    .eq("auth_user_id", user.id)
    .single();

  if (!broker || broker.status !== "approved") {
    return NextResponse.json({ error: "Broker not approved" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.price || !body?.subCategory || !body?.listingType || !body?.propertyType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("classifieds")
    .insert({
      broker_id:             broker.id,
      user_id:               user.id,
      owner_name:            body.ownerName ?? broker.name,
      contact_phone:         body.contactPhone ?? broker.phone,
      contact_preference:    body.contactPreference ?? "both",
      sub_category:          body.subCategory,
      listing_type:          body.listingType,
      project_id:            body.projectId || null,
      project_name:          body.projectName || null,
      is_standalone:         body.isStandalone ?? false,
      standalone_description: body.standaloneDescription || null,
      tower:                 body.tower || null,
      floor_number:          body.floorNumber ? Number(body.floorNumber) : null,
      unit_number:           body.unitNumber || null,
      property_type:         body.propertyType,
      bedrooms:              body.bedrooms || null,
      bathrooms:             body.bathrooms || null,
      carpet_area_sqft:      body.carpetAreaSqft ? Number(body.carpetAreaSqft) : null,
      parking:               body.parking || null,
      furnished:             body.furnished || null,
      available_from:        body.availableFrom || null,
      amenities:             body.amenities ?? [],
      price:                 body.price,
      deposit:               body.deposit || null,
      description:           body.description || null,
      photos:                body.photos ?? [],
      owner_consent:         true,
      consent_at:            new Date().toISOString(),
      status:                "active",   // broker listings go live immediately
      verified_at:           new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}
