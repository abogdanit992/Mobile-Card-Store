-- Scrolling ad banners + editable homepage content
-- Run AFTER supabase-migration-cms-payments.sql and supabase-migration-content.sql

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- ads: right-to-left marquee banners (backend-managed)
-- ---------------------------------------------------------------------------
create table if not exists public.ads (
  id uuid primary key default gen_random_uuid(),
  text_en text not null,
  text_zh text,
  link_url text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.ads enable row level security;

drop policy if exists "public_read_active_ads" on public.ads;
create policy "public_read_active_ads" on public.ads
  for select to anon, authenticated using (active = true);

drop policy if exists "admins_manage_ads" on public.ads;
create policy "admins_manage_ads" on public.ads
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.ads (text_en, text_zh, link_url, sort_order) values
  ('Add our support to claim your activation code — limited-time free trial!',
   '添加客服领取激活码，限时免费体验观看！', '/support', 1)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Editable homepage content (stored in site_settings key/value)
-- ---------------------------------------------------------------------------
insert into public.site_settings (key, value) values
  ('home_tagline_en', '""'::jsonb),
  ('home_tagline_zh', '""'::jsonb),
  ('home_hero_enabled', 'true'::jsonb),
  ('home_hero_eyebrow_en', '""'::jsonb),
  ('home_hero_eyebrow_zh', '""'::jsonb),
  ('home_hero_title_en', '""'::jsonb),
  ('home_hero_title_zh', '""'::jsonb),
  ('home_hero_desc_en', '""'::jsonb),
  ('home_hero_desc_zh', '""'::jsonb)
on conflict (key) do nothing;
