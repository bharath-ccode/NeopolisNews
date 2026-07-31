import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const admin = createAdminClient();
  const [totalRes, activeRes] = await Promise.all([
    admin.from("digest_subscribers").select("id", { count: "exact", head: true }),
    admin.from("digest_subscribers").select("id", { count: "exact", head: true }).eq("is_active", true),
  ]);
  return NextResponse.json({
    total: totalRes.count ?? 0,
    active: activeRes.count ?? 0,
  });
}
