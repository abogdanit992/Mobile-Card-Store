import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type PayOrderBody = {
  productId?: string;
  contactEmail?: string;
  contactPhone?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const body = (await request.json()) as PayOrderBody;
  const productId = body.productId;
  const contactEmail = body.contactEmail?.trim().toLowerCase();
  const contactPhone = body.contactPhone?.trim();

  if (!productId) {
    return NextResponse.json({ error: "Missing productId." }, { status: 400 });
  }
  if (!contactEmail || !isValidEmail(contactEmail)) {
    return NextResponse.json({ error: "Invalid contact email." }, { status: 400 });
  }
  if (!contactPhone || contactPhone.length < 6) {
    return NextResponse.json({ error: "Invalid contact phone." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id,price,active")
    .eq("id", productId)
    .eq("active", true)
    .maybeSingle();

  if (productError) {
    return NextResponse.json({ error: productError.message }, { status: 500 });
  }
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const orderPayload = [
    {
      product_id: product.id,
      amount: product.price,
      status: "paid",
      user_id: user?.id ?? null,
      contact_email: contactEmail,
      contact_phone: contactPhone,
    } satisfies Database["public"]["Tables"]["orders"]["Insert"],
  ];

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert(orderPayload)
    .select("id,product_id,status,amount")
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: orderError?.message ?? "Failed to create order." },
      { status: 500 },
    );
  }

  if (user?.id) {
    await supabase
      .from("users")
      .update({ phone: contactPhone })
      .eq("id", user.id);
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
    return NextResponse.json({ error: cardError.message }, { status: 500 });
  }

  if (!card) {
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", order.id);
    return NextResponse.json({ error: "No card inventory." }, { status: 409 });
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
    return NextResponse.json({ error: claimError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    productId: order.product_id,
  });
}
