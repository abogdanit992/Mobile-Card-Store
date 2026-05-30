-- Add card type (monthly / quarterly / annual / trial) to products.
-- Lets the Card Inventory page pick: platform (category) + card type → product.
-- Run once in Supabase SQL Editor.

alter table public.products
  add column if not exists card_type text;

-- Optional: best-effort backfill from existing titles (safe to re-run).
update public.products set card_type = 'monthly'
  where card_type is null and (title ilike '%月卡%' or title ilike '%monthly%');
update public.products set card_type = 'quarterly'
  where card_type is null and (title ilike '%季卡%' or title ilike '%quarter%');
update public.products set card_type = 'annual'
  where card_type is null and (title ilike '%年卡%' or title ilike '%annual%' or title ilike '%year%');
update public.products set card_type = 'trial'
  where card_type is null and (title ilike '%体验%' or title ilike '%trial%');
