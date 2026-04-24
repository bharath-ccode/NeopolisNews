import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { name, industry, types, subtypes, address, ownerEmail, ownerPhone } = body ?? {};

  if (!name || !industry || !types?.length || !address) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const id = Math.random().toString(36).slice(2, 10).toUpperCase();

  const supabase = createAdminClient();
  const { error } = await supabase.from("businesses").insert({
    id,
    name,
    industry,
    types,
    subtypes: subtypes ?? [],
    address,
    status: "invited",
    created_at: new Date().toISOString(),
    verified: false,
    owner_email: ownerEmail || null,
    owner_phone: ownerPhone || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id, name });
}
