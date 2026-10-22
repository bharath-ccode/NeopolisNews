import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("buyer_interests")
    .select("id, name, phone, email, property_type, bedrooms, areas, tiers, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
