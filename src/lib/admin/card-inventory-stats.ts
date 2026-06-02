import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Supabase = SupabaseClient<Database>;

export type CardInventoryCounts = {
  total: number;
  available: number;
  used: number;
};

export type CategoryCardInventory = CardInventoryCounts & {
  categoryId: string;
};

async function countCardsForProducts(
  supabase: Supabase,
  productIds: string[],
): Promise<CardInventoryCounts> {
  if (productIds.length === 0) {
    return { total: 0, available: 0, used: 0 };
  }

  const [totalRes, availableRes, usedRes] = await Promise.all([
    supabase
      .from("cards")
      .select("*", { count: "exact", head: true })
      .in("product_id", productIds),
    supabase
      .from("cards")
      .select("*", { count: "exact", head: true })
      .in("product_id", productIds)
      .eq("used", false),
    supabase
      .from("cards")
      .select("*", { count: "exact", head: true })
      .in("product_id", productIds)
      .eq("used", true),
  ]);

  return {
    total: totalRes.count ?? 0,
    available: availableRes.count ?? 0,
    used: usedRes.count ?? 0,
  };
}

export function groupProductIdsByCategory(
  products: { id: string; category_id: string | null }[],
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const product of products) {
    if (!product.category_id) continue;
    const list = map.get(product.category_id) ?? [];
    list.push(product.id);
    map.set(product.category_id, list);
  }
  return map;
}

export async function fetchSiteWideCardInventory(
  supabase: Supabase,
): Promise<CardInventoryCounts> {
  const [totalRes, availableRes, usedRes] = await Promise.all([
    supabase.from("cards").select("*", { count: "exact", head: true }),
    supabase
      .from("cards")
      .select("*", { count: "exact", head: true })
      .eq("used", false),
    supabase
      .from("cards")
      .select("*", { count: "exact", head: true })
      .eq("used", true),
  ]);

  return {
    total: totalRes.count ?? 0,
    available: availableRes.count ?? 0,
    used: usedRes.count ?? 0,
  };
}

export async function fetchCategoryCardInventories(
  supabase: Supabase,
  categoryIds: string[],
  productIdsByCategory: Map<string, string[]>,
): Promise<CategoryCardInventory[]> {
  return Promise.all(
    categoryIds.map(async (categoryId) => {
      const productIds = productIdsByCategory.get(categoryId) ?? [];
      const counts = await countCardsForProducts(supabase, productIds);
      return { categoryId, ...counts };
    }),
  );
}
