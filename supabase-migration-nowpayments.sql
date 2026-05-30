-- Add NOWPayments as a payment provider (non-custodial crypto gateway).
-- Run AFTER supabase-migration-cms-payments.sql

-- 1) Allow the new provider value on the channels table.
alter table public.payment_channels
  drop constraint if exists payment_channels_provider_check;

alter table public.payment_channels
  add constraint payment_channels_provider_check
  check (provider in ('cryptomus','nowpayments','stripe','paypal'));

-- 2) Seed a disabled NOWPayments channel (enable + add keys from the admin UI).
insert into public.payment_channels (provider, label_en, label_zh, enabled, sort_order) values
  ('nowpayments', 'Crypto (USDT/BTC/…)', '加密货币', false, 1)
on conflict (provider) do nothing;
