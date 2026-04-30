import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("businesses")
    .select("id, name, address, logo, subtypes, bms_code, bms_slug")
    .eq("status", "active")
    .eq("industry", "Entertainment")
    .contains("types", ["Cinema"])
    .order("name", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
