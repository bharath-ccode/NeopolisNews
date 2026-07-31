import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

/** GET — caption entries for a contest cartoon. */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("cartoon_captions")
    .select("id, author_name, body, created_at")
    .eq("cartoon_id", params.id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

/** POST { author_name, body } — one caption entry per user (token-verified). */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireUser(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => null);
  const { author_name, body: captionBody } = body ?? {};

  if (!author_name?.trim())  return NextResponse.json({ error: "author_name required" }, { status: 400 });
  if (!captionBody?.trim())  return NextResponse.json({ error: "Please write a caption." }, { status: 400 });
  if (captionBody.trim().length > 150)
    return NextResponse.json({ error: "Captions are 150 characters max — brevity is the soul of wit." }, { status: 400 });

  const admin = createAdminClient();

  const { data: cartoon } = await admin
    .from("daily_cartoons")
    .select("id, is_contest, winner_user_id, status")
    .eq("id", params.id)
    .single();
  if (!cartoon || cartoon.status !== "published")
    return NextResponse.json({ error: "Cartoon not found." }, { status: 404 });
  if (!cartoon.is_contest)
    return NextResponse.json({ error: "This cartoon isn't a caption contest." }, { status: 400 });
  if (cartoon.winner_user_id)
    return NextResponse.json({ error: "This contest has closed — a winner was picked." }, { status: 400 });

  const { data, error } = await admin
    .from("cartoon_captions")
    .insert({
      cartoon_id:  params.id,
      user_id:     auth.user.id,
      author_name: author_name.trim(),
      body:        captionBody.trim(),
    })
    .select("id, author_name, body, created_at")
    .single();

  if (error) {
    if (error.code === "23505")
      return NextResponse.json({ error: "You've already entered this contest." }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
