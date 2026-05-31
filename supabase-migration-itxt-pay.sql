-- ITXT aggregator: WeChat + Alipay merchant channels.
-- Run in Supabase SQL Editor after payment-channels-future.sql (safe to re-run).

alter table public.payment_channels
  drop constraint if exists payment_channels_provider_check;

alter table public.payment_channels
  add constraint payment_channels_provider_check
  check (provider in (
    'cryptomus',
    'nowpayments',
    'stripe',
    'direct_usdt',
    'wechat',
    'alipay',
    'wechat_personal',
    'alipay_personal',
    'paypal_personal',
    'paypal_business',
    'paypal'
  ));

-- Rename legacy personal placeholders → merchant channels (keep config if any)
update public.payment_channels
set
  provider = 'wechat',
  label_en = 'WeChat Pay',
  label_zh = '微信支付'
where provider = 'wechat_personal';

update public.payment_channels
set
  provider = 'alipay',
  label_en = 'Alipay',
  label_zh = '支付宝'
where provider = 'alipay_personal';

insert into public.payment_channels (provider, label_en, label_zh, enabled, sort_order)
select v.provider, v.label_en, v.label_zh, false, v.sort_order
from (values
  ('wechat', 'WeChat Pay', '微信支付', 10),
  ('alipay', 'Alipay',     '支付宝',   11)
) as v(provider, label_en, label_zh, sort_order)
where not exists (
  select 1 from public.payment_channels pc where pc.provider = v.provider
);

-- Tighten constraint after migration (drop legacy personal names)
alter table public.payment_channels
  drop constraint if exists payment_channels_provider_check;

alter table public.payment_channels
  add constraint payment_channels_provider_check
  check (provider in (
    'cryptomus',
    'nowpayments',
    'stripe',
    'direct_usdt',
    'wechat',
    'alipay',
    'paypal_personal',
    'paypal_business',
    'paypal'
  ));

-- Pre-fill ITXT gateway credentials (shared mid/secret; per-channel channel_code).
-- Toggle Enabled in Admin → Payments when ready to go live.
update public.payment_channels
set
  enabled = false,
  config = jsonb_build_object(
    'mid', 'M200044',
    'merchant_secret', '82bf9a258b5889b739ed315620659c0c',
    'api_base_url', 'http://RfBseViEKZlMAmu7ArWO.itxt002.xyz',
    'channel_code', '1111',
    'callback_ips', '136.110.35.126'
  )
where provider = 'wechat';

update public.payment_channels
set
  enabled = false,
  config = jsonb_build_object(
    'mid', 'M200044',
    'merchant_secret', '82bf9a258b5889b739ed315620659c0c',
    'api_base_url', 'http://RfBseViEKZlMAmu7ArWO.itxt002.xyz',
    'channel_code', '111',
    'callback_ips', '136.110.35.126'
  )
where provider = 'alipay';

