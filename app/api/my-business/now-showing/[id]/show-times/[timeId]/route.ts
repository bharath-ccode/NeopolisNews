import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { resolveBusinessAuth } from "@/lib/myBusinessAuth";

/** DELETE ?businessId= — remove one showtime. */
export async function DELETE(req: NextRequest, { params }: { params: { id: string; timeId: string } }) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required." }, { status: 400 });

  const auth = await resolveBusinessAuth(req, businessId);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();
  const { data: movie } = await admin
    .from("now_showing")
    .select("id")
    .eq("id", params.id)
    .eq("business_id", businessId)
    .maybeSingle();
  if (!movie) return NextResponse.json({ error: "Movie not found." }, { status: 404 });

  const { error } = await admin
    .from("show_times")
    .delete()
    .eq("id", params.timeId)
    .eq("movie_id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
