import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = createAdminClient();

  const { data: biz } = await admin
    .from("businesses")
    .select("is_featured")
    .eq("id", params.id)
    .single();

  if (!biz) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const newVal = !biz.is_featured;
  const { error } = await admin
    .from("businesses")
    .update({ is_featured: newVal })
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ is_featured: newVal });
}
