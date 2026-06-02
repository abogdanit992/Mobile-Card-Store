import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { CardTypeValue } from "@/lib/card-types";

type AdminClient = SupabaseClient<Database>;

export type OrderProductContext = {
  productId: string;
  cardType: string | null;
  categoryId: string | null;
  stackMonthlyCodes: boolean;
};

/** How many card codes to issue for a product card_type (Squid stack mode). */
export function codesCountForCardType(cardType: string | null | undefined): number {
  switch (cardType as CardTypeValue | null) {
    case "quarterly":
      return 3;
    case "annual":
      return 12;
    case "monthly":
    case "trial":
    default:
      return 1;
  }
}

export async function getOrderProductContext(
  admin: AdminClient,
  productId: string,
): Promise<OrderProductContext | null> {
  const { data: product } = await admin
    .from("products")
    .select("id,category_id,card_type")
    .eq("id", productId)
    .maybeSingle();

  if (!product) return null;

  let stackMonthlyCodes = false;
  if (product.category_id) {
    const { data: category } = await admin
      .from("categories")
      .select("stack_monthly_codes")
      .eq("id", product.category_id)
      .maybeSingle();
    stackMonthlyCodes = Boolean(category?.stack_monthly_codes);
  }

  return {
    productId: product.id,
    cardType: product.card_type,
    categoryId: product.category_id,
    stackMonthlyCodes,
  };
}

async function findMonthlyProductId(
  admin: AdminClient,
  categoryId: string,
): Promise<string | null> {
  const { data } = await admin
    .from("products")
    .select("id")
    .eq("category_id", categoryId)
    .eq("card_type", "monthly")
    .eq("active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data?.id ?? null;
}

async function releaseCardsForOrder(admin: AdminClient, orderId: string) {
  await admin
    .from("cards")
    .update({
      used: false,
      used_order_id: null,
      used_at: null,
    })
    .eq("used_order_id", orderId);
}

async function claimOneCard(
  admin: AdminClient,
  orderId: string,
  inventoryProductId: string,
): Promise<string | null> {
  const { data: card } = await admin
    .from("cards")
    .select("id,code")
    .eq("product_id", inventoryProductId)
    .eq("used", false)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!card) return null;

  const { error, data: claimed } = await admin
    .from("cards")
    .update({
      used: true,
      used_order_id: orderId,
      used_at: new Date().toISOString(),
    })
    .eq("id", card.id)
    .eq("used", false)
    .select("code")
    .maybeSingle();

  if (error || !claimed?.code) return null;
  return claimed.code;
}

/**
 * Allocate card code(s) for a paid order.
 * Returns null if inventory insufficient or configuration invalid.
 */
export async function allocateCardsForOrder(
  admin: AdminClient,
  orderId: string,
  productId: string,
): Promise<string[] | null> {
  const { data: existing } = await admin
    .from("cards")
    .select("code")
    .eq("used_order_id", orderId)
    .order("used_at", { ascending: true });

  if (existing && existing.length > 0) {
    return existing.map((r) => r.code);
  }

  const ctx = await getOrderProductContext(admin, productId);
  if (!ctx) return null;

  let inventoryProductId = productId;
  let needed = 1;

  if (ctx.stackMonthlyCodes) {
    if (!ctx.categoryId) return null;
    const monthlyId = await findMonthlyProductId(admin, ctx.categoryId);
    if (!monthlyId) return null;
    inventoryProductId = monthlyId;
    needed = codesCountForCardType(ctx.cardType);
  }

  const { count, error: countError } = await admin
    .from("cards")
    .select("id", { count: "exact", head: true })
    .eq("product_id", inventoryProductId)
    .eq("used", false);

  if (countError || count === null || count < needed) {
    return null;
  }

  const codes: string[] = [];
  for (let i = 0; i < needed; i++) {
    const code = await claimOneCard(admin, orderId, inventoryProductId);
    if (!code) {
      await releaseCardsForOrder(admin, orderId);
      return null;
    }
    codes.push(code);
  }

  return codes;
}

/** @deprecated Use allocateCardsForOrder — returns first code only. */
export async function allocateCardForOrder(
  admin: AdminClient,
  orderId: string,
  productId: string,
): Promise<string | null> {
  const codes = await allocateCardsForOrder(admin, orderId, productId);
  return codes?.[0] ?? null;
}
