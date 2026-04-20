import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

async function getBroker(userId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("brokers")
    .select("id, status")
    .eq("auth_user_id", userId)
    .single();
  return data;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const broker = await getBroker(user.id);
  if (!broker || broker.status !== "approved") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("classifieds")
    .select("*")
    .eq("id", params.id)
    .eq("broker_id", broker.id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const broker = await getBroker(user.id);
  if (!broker || broker.status !== "approved") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("classifieds")
    .update({
      owner_name:            body.ownerName,
      contact_phone:         body.contactPhone,
      contact_preference:    body.contactPreference,
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
    })
    .eq("id", params.id)
    .eq("broker_id", broker.id)
    .select("id")
    .single();

  if (error || !data) return NextResponse.json({ error: error?.message ?? "Not found" }, { status: error ? 500 : 404 });
  return NextResponse.json({ id: data.id });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const broker = await getBroker(user.id);
  if (!broker || broker.status !== "approved") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("classifieds")
    .delete()
    .eq("id", params.id)
    .eq("broker_id", broker.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
