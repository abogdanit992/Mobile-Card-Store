-- Direct USDT-TRC20 payment (no gateway; unique amount + TronGrid polling).
-- Run AFTER supabase-migration-nowpayments.sql (or cms-payments.sql).

-- 1) Order fields for exact on-chain amount matching
alter table public.orders
  add column if not exists pay_amount_exact numeric(18, 6),
  add column if not exists expires_at timestamptz;

create index if not exists idx_orders_pending_pay_exact
  on public.orders (status, pay_amount_exact)
  where status = 'pending' and pay_amount_exact is not null;

-- 2) Allow direct_usdt provider on payment_channels
alter table public.payment_channels
  drop constraint if exists payment_channels_provider_check;

alter table public.payment_channels
  add constraint payment_channels_provider_check
  check (provider in ('cryptomus','nowpayments','stripe','paypal','direct_usdt'));

-- 3) Seed disabled direct USDT channel (enable + wallet in admin UI)
insert into public.payment_channels (provider, label_en, label_zh, enabled, sort_order) values
  ('direct_usdt', 'USDT (TRC20 direct)', 'USDT 直连', false, 0)
on conflict (provider) do nothing;
