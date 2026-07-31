import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // Support both cookie-based (web) and Bearer token (mobile)
  const authHeader = req.headers.get("authorization");
  const admin = createAdminClient();

  let userId: string | null = null;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { data: { user } } = await admin.auth.getUser(token);
    userId = user?.id ?? null;
  } else {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  }

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await admin.rpc("claim_event_slot", { event_id: params.id });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return NextResponse.json({ error: "Sold out" }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
