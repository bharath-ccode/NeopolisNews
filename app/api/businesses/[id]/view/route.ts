import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = createAdminClient();
  await admin.rpc("increment_business_views", { biz_id: params.id });
  return NextResponse.json({ ok: true });
}
