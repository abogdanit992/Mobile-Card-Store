-- P2: CMS (categories, platform downloads, bilingual products),
-- payment channels + payments, and site settings.
-- Run AFTER: schema, rls-and-seed, order-flow-policies, admin policies,
-- migration-p0-p1, migration-platforms.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Site settings (single-row key/value, e.g. enabled languages)
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (key, value) values
  ('enabled_languages', '["en","zh"]'::jsonb),
  ('default_language', '"en"'::jsonb)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Categories (storefront sections / box brands)
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_en text not null,
  name_zh text,
  icon_url text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_categories_active_sort
  on public.categories(active, sort_order);

-- Seed from previously hardcoded platforms.ts
insert into public.categories (slug, name_en, name_zh, icon_url, sort_order, active) values
  ('wuzei',   'Squid',  '乌贼', 'http://vipfkk.com/content/uploadfile/202512/3d401765464553.png', 1, true),
  ('dongni',  'Dongni', '懂你', 'http://vipfkk.com/content/uploadfile/202601/3fa11769080520.png', 2, true),
  ('baoyu',   'Abalone','鲍鱼', 'http://vipfkk.com/content/uploadfile/202512/af8c1765465348.png', 3, true),
  ('ningmeng','Lemon',  '柠檬', 'http://vipfkk.com/content/uploadfile/202512/aa591765466150.png', 4, true)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Platform downloads (per-app download links)
-- ---------------------------------------------------------------------------
create table if not exists public.platform_downloads (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name_en text not null,
  name_zh text,
  logo_url text,
  android_url text,
  ios_url text,
  cloud_url text,
  download_page text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_platform_downloads_active_sort
  on public.platform_downloads(active, sort_order);

-- Seed box apps
insert into public.platform_downloads
  (category_id, name_en, name_zh, logo_url, android_url, ios_url, cloud_url, download_page, sort_order, active)
select c.id, v.name_en, v.name_zh, v.logo_url, v.android_url, v.ios_url, v.cloud_url, v.download_page, v.sort_order, true
from (values
  ('wuzei', 'Squid', '乌贼',
   'https://juhe.live/uploads/images/20250323/ef844533045ddc0523d6c17e4025fe3d.png',
   'http://5243.sunmoonweb.com/d/20251220/WZ/Wz0520.apk?sign=xObcDLPMFQVvKv_qed_qZcCPn2o_myYjsbsHdmIPEyA=:0',
   'itms-services://?action=download-manifest&url=https://juhe.live/wuzei.plist',
   'https://wwrp.lanzout.com/b0xvms62d',
   'https://juhe.live/juhezhibo/14.html', 1),
  ('dongni', 'Dongni', '懂你',
   'https://juhe.live/uploads/images/20260122/10b7c73d912e3b885923f7c80be09d68.png',
   'http://5243.sunmoonweb.com/d/20251220/%E6%87%82%E4%BD%A0/dn148.apk?sign=r8jPnvYFce9amKOnxvVg12DYshmkroC6fzv-FXDD7TE=:0',
   'https://wwazw.lanzouu.com/iJJkl3py1wbc',
   'https://www.dn1.live/?promo_code=111888',
   'https://juhe.live/juhezhibo/18.html', 2),
  ('baoyu', 'Abalone', '鲍鱼',
   'https://juhe.live/uploads/images/20250323/36254e93efe48762a520dcc18e980ccd.png',
   'http://5243.sunmoonweb.com/d/20251220/by/By%E5%AE%89%E5%8D%93%E7%89%885.0.0.apk?sign=EVA6zsimWpVovxa63fbiEZv1MF3QQYwKFsI9Z0nSBGc=:0',
   'itms-services://?action=download-manifest&url=https://juhe.live/baoyu.plist',
   'https://wwbeb.lanzout.com/b0xvbpbkh',
   'https://juhe.live/juhezhibo/12.html', 3),
  ('ningmeng', 'Lemon', '柠檬',
   'https://juhe.live/uploads/images/20250323/c3d27bf7eb39753b19fc1cf2dd6c8285.png',
   'https://d2xrad32j31ow0.cloudfront.net/#/?cede=SVELML',
   '', '',
   'https://juhe.live/juhezhibo/13.html', 4)
) as v(cat_slug, name_en, name_zh, logo_url, android_url, ios_url, cloud_url, download_page, sort_order)
join public.categories c on c.slug = v.cat_slug
where not exists (
  select 1 from public.platform_downloads p where p.name_en = v.name_en
);

-- ---------------------------------------------------------------------------
-- Products: bilingual + category link
-- ---------------------------------------------------------------------------
alter table public.products
  add column if not exists name_en text,
  add column if not exists name_zh text,
  add column if not exists description_en text,
  add column if not exists description_zh text,
  add column if not exists category_id uuid references public.categories(id) on delete set null;

-- Backfill localized names from existing title and link category by sort
update public.products set name_en = coalesce(name_en, title);
update public.products set name_zh = coalesce(name_zh, title);

update public.products p
set category_id = c.id
from public.categories c
where p.category_id is null
  and (
    (p.category_sort = '1' and c.slug = 'wuzei') or
    (p.category_sort = '2' and c.slug = 'baoyu') or
    (p.category_sort = '3' and c.slug = 'ningmeng') or
    (p.category_sort = '5' and c.slug = 'dongni')
  );

-- ---------------------------------------------------------------------------
-- Payment channels (admin-configured; secrets stay server-side)
-- ---------------------------------------------------------------------------
create table if not exists public.payment_channels (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('cryptomus','stripe','paypal')),
  label_en text not null,
  label_zh text,
  enabled boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (provider)
);

insert into public.payment_channels (provider, label_en, label_zh, enabled, sort_order) values
  ('cryptomus', 'Crypto (USDT/BTC/…)', '加密货币', false, 1),
  ('stripe',    'Card / Apple Pay / Google Pay', '银行卡/Apple Pay', false, 2),
  ('paypal',    'PayPal', 'PayPal', false, 3)
on conflict (provider) do nothing;

-- Public-safe view (no secrets) for storefront
create or replace view public.payment_channels_public as
  select id, provider, label_en, label_zh, enabled, sort_order
  from public.payment_channels
  where enabled = true;

-- ---------------------------------------------------------------------------
-- Payments (one per checkout attempt; webhook updates status)
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  provider text not null,
  provider_payment_id text,
  status text not null default 'pending'
    check (status in ('pending','paid','failed','expired','cancelled')),
  amount numeric(10,2) not null,
  currency text not null default 'USD',
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_payments_order on public.payments(order_id);
create index if not exists idx_payments_provider_pid
  on public.payments(provider, provider_payment_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.site_settings enable row level security;
alter table public.categories enable row level security;
alter table public.platform_downloads enable row level security;
alter table public.payment_channels enable row level security;
alter table public.payments enable row level security;

-- Public read for active CMS content
drop policy if exists "public_read_settings" on public.site_settings;
create policy "public_read_settings" on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists "public_read_active_categories" on public.categories;
create policy "public_read_active_categories" on public.categories
  for select to anon, authenticated using (active = true);

drop policy if exists "public_read_active_platforms" on public.platform_downloads;
create policy "public_read_active_platforms" on public.platform_downloads
  for select to anon, authenticated using (active = true);

-- payment_channels base table: NO anon select (secrets in config).
-- Storefront uses payment_channels_public view + service role for config.
-- Admins manage via service role on the server.

-- Helper: is the current auth user an admin?
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admins a
    where a.email = (auth.jwt() ->> 'email')
  );
$$;

drop policy if exists "admins_manage_categories" on public.categories;
create policy "admins_manage_categories" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins_manage_platforms" on public.platform_downloads;
create policy "admins_manage_platforms" on public.platform_downloads
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins_manage_settings" on public.site_settings;
create policy "admins_manage_settings" on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins_manage_payment_channels" on public.payment_channels;
create policy "admins_manage_payment_channels" on public.payment_channels
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins_read_payments" on public.payments;
create policy "admins_read_payments" on public.payments
  for select to authenticated using (public.is_admin());

-- Allow public view read
grant select on public.payment_channels_public to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Customers (marketing profiles, populated on each paid order)
-- ---------------------------------------------------------------------------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  email text,
  phone text,
  order_count int not null default 0,
  total_spent numeric(12,2) not null default 0,
  first_seen timestamptz not null default now(),
  last_order_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists uq_customers_email
  on public.customers(email) where email is not null;
create unique index if not exists uq_customers_phone
  on public.customers(phone) where phone is not null;

alter table public.customers enable row level security;

drop policy if exists "admins_manage_customers" on public.customers;
create policy "admins_manage_customers" on public.customers
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
