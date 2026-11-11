import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const ADVERTISE_PURPOSES = [
  "advertise-sales",
  "advertise-real-estate",
  "advertise-health",
  "advertise-education",
  "advertise-services",
];

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("leads")
    .select("id, name, phone, email, message, purpose, created_at")
    .in("purpose", ADVERTISE_PURPOSES)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
