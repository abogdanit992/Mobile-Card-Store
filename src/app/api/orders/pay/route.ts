import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type PayOrderBody = {
  productId?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as PayOrderBody;
  const productId = body.productId;

  if (!productId) {
    return NextResponse.json(
      { error: "Missing productId in request body." },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id,price,active")
    .eq("id", productId)
    .eq("active", true)
    .maybeSingle();

  if (productError) {
    return NextResponse.json(
      { error: `Failed to load product: ${productError.message}` },
      { status: 500 },
    );
  }

  if (!product) {
    return NextResponse.json(
      { error: "Product not found or inactive." },
      { status: 404 },
    );
  }

  const orderPayload = [
    {
      product_id: product.id,
      amount: product.price,
      status: "paid",
    } satisfies Database["public"]["Tables"]["orders"]["Insert"],
  ];
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert(orderPayload)
    .select("id,product_id,status,amount")
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: `Failed to create order: ${orderError?.message ?? "Unknown"}` },
      { status: 500 },
    );
  }

  const { data: card, error: cardError } = await supabase
    .from("cards")
    .select("id,code,used")
    .eq("product_id", product.id)
    .eq("used", false)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (cardError) {
    return NextResponse.json(
      { error: `Failed to check card inventory: ${cardError.message}` },
      { status: 500 },
    );
  }

  if (!card) {
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", order.id);
    return NextResponse.json(
      { error: "No available card inventory for this product." },
      { status: 409 },
    );
  }

  const { error: claimError } = await supabase
    .from("cards")
    .update({
      used: true,
      used_order_id: order.id,
      used_at: new Date().toISOString(),
    })
    .eq("id", card.id)
    .eq("used", false);

  if (claimError) {
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", order.id);
    return NextResponse.json(
      { error: `Failed to allocate card: ${claimError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    productId: order.product_id,
  });
}
