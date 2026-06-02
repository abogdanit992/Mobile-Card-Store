import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { codesCountForCardType } from "@/lib/orders/card-allocation";

export type VerifiedOrder = {
  id: string;
  status: string;
  amount: number;
  product_id: string;
  contact_email: string | null;
  contact_phone: string | null;
};

export type OrderCardDelivery = {
  codes: string[];
  cardType: string | null;
  stackMonthlyCodes: boolean;
  expectedCount: number;
};

function normalizeEmail(value: string | undefined | null): string | null {
  const v = value?.trim().toLowerCase();
  return v || null;
}

function normalizePhone(value: string | undefined | null): string | null {
  const v = value?.trim();
  return v || null;
}

/** Verify checkout contact matches the order (server-side only). */
export function contactMatchesOrder(
  order: Pick<VerifiedOrder, "contact_email" | "contact_phone">,
  email: string | null,
  phone: string | null,
): boolean {
  const orderEmail = normalizeEmail(order.contact_email);
  const orderPhone = normalizePhone(order.contact_phone);

  if (email && orderEmail && email === orderEmail) return true;
  if (phone && orderPhone && phone === orderPhone) return true;
  return false;
}

export async function fetchOrderForContactVerification(
  orderId: string,
): Promise<VerifiedOrder | null> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("orders")
    .select("id,status,amount,product_id,contact_email,contact_phone")
    .eq("id", orderId)
    .maybeSingle();
  return data;
}

export async function fetchCardsForOrder(orderId: string): Promise<string[]> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("cards")
    .select("code")
    .eq("used_order_id", orderId)
    .order("used_at", { ascending: true });

  return (data ?? []).map((r) => r.code);
}

/** @deprecated Use fetchCardsForOrder */
export async function fetchCardForOrder(orderId: string) {
  const codes = await fetchCardsForOrder(orderId);
  if (codes.length === 0) return null;
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("cards")
    .select("id,code,used,used_at")
    .eq("used_order_id", orderId)
    .order("used_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function fetchOrderCardDelivery(
  orderId: string,
): Promise<OrderCardDelivery | null> {
  const admin = createSupabaseAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("product_id")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return null;

  const codes = await fetchCardsForOrder(orderId);

  const { data: product } = await admin
    .from("products")
    .select("card_type,category_id")
    .eq("id", order.product_id)
    .maybeSingle();

  let stackMonthlyCodes = false;
  if (product?.category_id) {
    const { data: category } = await admin
      .from("categories")
      .select("stack_monthly_codes")
      .eq("id", product.category_id)
      .maybeSingle();
    stackMonthlyCodes = Boolean(category?.stack_monthly_codes);
  }

  const cardType = product?.card_type ?? null;
  const expectedCount = stackMonthlyCodes
    ? codesCountForCardType(cardType)
    : 1;

  return {
    codes,
    cardType,
    stackMonthlyCodes,
    expectedCount,
  };
}

export async function lookupOrdersByContact(
  email: string | null,
  phone: string | null,
) {
  const admin = createSupabaseAdminClient();
  let query = admin
    .from("orders")
    .select("id,amount,status,created_at,contact_phone,contact_email")
    .order("created_at", { ascending: false })
    .limit(50);

  if (email) {
    query = query.eq("contact_email", email);
  }
  if (phone) {
    query = query.eq("contact_phone", phone);
  }

  const { data, error } = await query;
  return { data: data ?? [], error };
}
