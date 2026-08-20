import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { optionalUser } from "@/lib/apiAuth";
import { getPollWithResults } from "@/lib/pollResults";

export const dynamic = "force-dynamic";

/** GET — a single published poll's live results, for the archive view. */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = createAdminClient();
  const user = await optionalUser(req);

  const { data: poll } = await admin
    .from("polls")
    .select("id, question, publish_date")
    .eq("id", params.id)
    .eq("status", "published")
    .maybeSingle();
  if (!poll) return NextResponse.json({ error: "Poll not found" }, { status: 404 });

  return NextResponse.json(await getPollWithResults(admin, poll, user?.id));
}
