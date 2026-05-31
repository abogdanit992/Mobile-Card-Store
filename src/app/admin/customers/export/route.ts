import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdminRoute } from "@/lib/auth/require-admin";
import { logAdminAudit } from "@/lib/security/audit-log";

function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  const gate = await requireAdminRoute();
  if (!gate.ok) return gate.response;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("customers")
    .select("email,phone,order_count,total_spent,first_seen,last_order_at")
    .order("last_order_at", { ascending: false });

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  await logAdminAudit(gate.email, "customers.export", {
    rows: data?.length ?? 0,
  });

  const header = [
    "email",
    "phone",
    "order_count",
    "total_spent",
    "first_seen",
    "last_order_at",
  ];
  const rows = (data ?? []).map((c) =>
    [
      c.email,
      c.phone,
      c.order_count,
      c.total_spent,
      c.first_seen,
      c.last_order_at,
    ]
      .map(csvCell)
      .join(","),
  );
  const csv = [header.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="customers-${Date.now()}.csv"`,
    },
  });
}
