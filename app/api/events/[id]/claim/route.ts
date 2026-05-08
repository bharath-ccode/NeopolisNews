import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("claim_event_slot", { event_id: params.id });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return NextResponse.json({ error: "Sold out" }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
