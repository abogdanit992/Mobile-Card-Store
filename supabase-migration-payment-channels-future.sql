-- Future payment channels (WeChat / Alipay personal, PayPal personal + business).
-- Run in Supabase SQL Editor. Safe to run multiple times.
--
-- Channels are seeded DISABLED — enable in Admin → Payments when API keys are ready.
-- Stripe = credit/debit cards (already exists).

alter table public.payment_channels
  drop constraint if exists payment_channels_provider_check;

alter table public.payment_channels
  add constraint payment_channels_provider_check
  check (provider in (
    'cryptomus',
    'nowpayments',
    'stripe',
    'direct_usdt',
    'wechat_personal',
    'alipay_personal',
    'paypal_personal',
    'paypal_business',
    'paypal'
  ));

-- Legacy single PayPal row → business account (keep config)
update public.payment_channels
set
  provider = 'paypal_business',
  label_en = coalesce(nullif(label_en, ''), 'PayPal Business'),
  label_zh = coalesce(label_zh, 'PayPal 商业账户')
where provider = 'paypal';

-- Stripe storefront label
update public.payment_channels
set
  label_en = 'Credit / Debit Card',
  label_zh = coalesce(label_zh, '信用卡 / 借记卡')
where provider = 'stripe';

insert into public.payment_channels (provider, label_en, label_zh, enabled, sort_order)
select v.provider, v.label_en, v.label_zh, false, v.sort_order
from (values
  ('wechat_personal',  'WeChat Pay (Personal)',     '微信支付（个人）',     10),
  ('alipay_personal',  'Alipay (Personal)',         '支付宝（个人）',       11),
  ('paypal_personal',  'PayPal (Personal)',         'PayPal（个人）',       12),
  ('paypal_business',  'PayPal (Business)',         'PayPal（商业）',       13)
) as v(provider, label_en, label_zh, sort_order)
where not exists (
  select 1 from public.payment_channels pc where pc.provider = v.provider
);
