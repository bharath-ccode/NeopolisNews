import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search    = searchParams.get("search")?.trim().toLowerCase() ?? "";
  const status    = searchParams.get("status") ?? "";
  const dateFrom  = searchParams.get("from") ?? "";
  const dateTo    = searchParams.get("to") ?? "";
  const type      = searchParams.get("type") ?? "";

  const admin = createAdminClient();

  let query = admin
    .from("session_enrollments")
    .select(`
      id, user_id, user_email, payment_status, amount_inr,
      razorpay_order_id, razorpay_payment_id, enrolled_at, paid_at,
      wellness_sessions (
        id, session_type, trainer_name, platform_label, language,
        start_date, end_date, business_id
      )
    `)
    .order("enrolled_at", { ascending: false })
    .limit(500);

  if (status)   query = query.eq("payment_status", status);
  if (dateFrom) query = query.gte("enrolled_at", dateFrom);
  if (dateTo)   query = query.lte("enrolled_at", dateTo + "T23:59:59Z");

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let rows = data ?? [];

  // Client-side search (email, trainer name, session type)
  if (search) {
    rows = rows.filter((r) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ws = r.wellness_sessions as any;
      return (
        r.user_email?.toLowerCase().includes(search) ||
        ws?.session_type?.toLowerCase().includes(search) ||
        ws?.trainer_name?.toLowerCase().includes(search)
      );
    });
  }

  // Filter by session type
  if (type) {
    rows = rows.filter((r) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ws = r.wellness_sessions as any;
      return ws?.session_type === type;
    });
  }

  // Summary stats
  const paid    = rows.filter((r) => r.payment_status === "paid");
  const pending = rows.filter((r) => r.payment_status === "pending");
  const failed  = rows.filter((r) => r.payment_status === "failed");
  const totalRevenue = paid.reduce((sum, r) => sum + (r.amount_inr ?? 0), 0);

  return NextResponse.json({
    rows,
    stats: {
      total: rows.length,
      paid: paid.length,
      pending: pending.length,
      failed: failed.length,
      revenue: totalRevenue,
    },
  });
}
