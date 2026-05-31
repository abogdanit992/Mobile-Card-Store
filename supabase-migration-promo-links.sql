-- Promotion broadcast link map (admin reference; hidden from storefront).
-- Run in Supabase SQL Editor AFTER supabase-migration-content.sql
--
-- These rows use active = false so they do NOT appear on the main site header.
-- Copy the "Promo path" column to your separate marketing domain, e.g.:
--   https://YOUR-PROMO-DOMAIN.com/vip  →  redirect/landing → vkeyshop.co

insert into public.quick_links (label_en, label_zh, url, is_external, sort_order, active)
select v.label_en, v.label_zh, v.url, true, v.sort_order, false
from (values
  (
    '[Promo] /vip → Home',
    '推广路径 /vip → 主站首页',
    'https://vkeyshop.co/?utm_source=broadcast&utm_medium=promo&utm_campaign=vip',
    101
  ),
  (
    '[Promo] /card → Shop cards',
    '推广路径 /card → 选购卡密',
    'https://vkeyshop.co/?utm_source=broadcast&utm_medium=promo&utm_campaign=card',
    102
  ),
  (
    '[Promo] /live → VIP zone',
    '推广路径 /live → VIP专区',
    'https://vkeyshop.co/?utm_source=broadcast&utm_medium=promo&utm_campaign=live',
    103
  ),
  (
    '[Promo] /month → Monthly pass',
    '推广路径 /month → 月卡（首页选商品）',
    'https://vkeyshop.co/?utm_source=broadcast&utm_medium=promo&utm_campaign=month',
    104
  ),
  (
    '[Promo] /season → Quarterly',
    '推广路径 /season → 季卡',
    'https://vkeyshop.co/?utm_source=broadcast&utm_medium=promo&utm_campaign=season',
    105
  ),
  (
    '[Promo] /year → Annual',
    '推广路径 /year → 年卡',
    'https://vkeyshop.co/?utm_source=broadcast&utm_medium=promo&utm_campaign=year',
    106
  ),
  (
    '[Promo] /trial → Trial / entry',
    '推广路径 /trial → 体验/入门',
    'https://vkeyshop.co/?utm_source=broadcast&utm_medium=promo&utm_campaign=trial',
    107
  ),
  (
    '[Promo] /download → Apps',
    '推广路径 /download → 软件下载',
    'https://vkeyshop.co/download?utm_source=broadcast&utm_medium=promo&utm_campaign=download',
    108
  ),
  (
    '[Promo] /support → Help',
    '推广路径 /support → 在线客服',
    'https://vkeyshop.co/support?utm_source=broadcast&utm_medium=promo&utm_campaign=support',
    109
  ),
  (
    '[Promo] /order → Track order',
    '推广路径 /order → 查单',
    'https://vkeyshop.co/orders/lookup?utm_source=broadcast&utm_medium=promo&utm_campaign=order',
    110
  )
) as v(label_en, label_zh, url, sort_order)
where not exists (
  select 1 from public.quick_links where label_en like '[Promo]%'
);
