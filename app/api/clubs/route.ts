import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isClubCategory } from "@/lib/clubs";

export const dynamic = "force-dynamic";

/** GET ?category= — active clubs for the public directory. */
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");

  const admin = createAdminClient();
  let query = admin
    .from("clubs")
    .select("id, name, category, emoji, description, lead_name, member_count, created_at")
    .eq("status", "active")
    .order("member_count", { ascending: false });

  if (category && isClubCategory(category)) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

/** POST — propose a club (lands as 'pending' for admin review). */
export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { user_id, lead_name, name, category, description, emoji } = body as {
    user_id?: string; lead_name?: string; name?: string;
    category?: string; description?: string; emoji?: string;
  };

  if (!user_id)           return NextResponse.json({ error: "Sign in to propose a club." },      { status: 401 });
  if (!lead_name?.trim()) return NextResponse.json({ error: "lead_name required" },              { status: 400 });
  if (!name?.trim())      return NextResponse.json({ error: "Please name your club." },          { status: 400 });
  if (name.trim().length > 60)
    return NextResponse.json({ error: "Club name is too long (max 60 characters)." }, { status: 400 });
  if (!category || !isClubCategory(category))
    return NextResponse.json({ error: "Please pick a category." }, { status: 400 });
  if (!description?.trim())
    return NextResponse.json({ error: "Tell us what the club will do." }, { status: 400 });
  if (description.trim().length > 1000)
    return NextResponse.json({ error: "Description is too long (max 1000 characters)." }, { status: 400 });

  const admin = createAdminClient();

  // One pending proposal per user keeps the queue honest
  const { count } = await admin
    .from("clubs")
    .select("id", { count: "exact", head: true })
    .eq("lead_user_id", user_id)
    .eq("status", "pending");
  if ((count ?? 0) >= 1)
    return NextResponse.json(
      { error: "You already have a club proposal awaiting review." },
      { status: 429 }
    );

  const { data, error } = await admin
    .from("clubs")
    .insert({
      name:         name.trim(),
      category,
      emoji:        emoji?.trim() || "🌟",
      description:  description.trim(),
      lead_user_id: user_id,
      lead_name:    lead_name.trim(),
    })
    .select("id, status")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
