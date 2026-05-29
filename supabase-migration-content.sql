-- P3: Editable storefront content
--   * quick_links  : top quick-link buttons (backend-managed)
--   * faqs         : FAQ entries (backend-managed, our own page)
--   * site_settings: support_chat_url (online customer service link)
-- Run AFTER supabase-migration-cms-payments.sql

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Quick links (storefront top buttons)
-- ---------------------------------------------------------------------------
create table if not exists public.quick_links (
  id uuid primary key default gen_random_uuid(),
  label_en text not null,
  label_zh text,
  url text not null,
  is_external boolean not null default false,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_quick_links_active_sort
  on public.quick_links(active, sort_order);

-- Seed our own links only (no third-party brand links)
insert into public.quick_links (label_en, label_zh, url, is_external, sort_order, active)
select v.label_en, v.label_zh, v.url, v.is_external, v.sort_order, true
from (values
  ('Downloads',   '软件下载', '/download',      false, 1),
  ('FAQ',         '常见问题', '/faq',           false, 2),
  ('Track Order', '查询订单', '/orders/lookup', false, 3)
) as v(label_en, label_zh, url, is_external, sort_order)
where not exists (select 1 from public.quick_links);

-- ---------------------------------------------------------------------------
-- FAQ entries
-- ---------------------------------------------------------------------------
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question_en text not null,
  question_zh text,
  answer_en text not null,
  answer_zh text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_faqs_active_sort
  on public.faqs(active, sort_order);

insert into public.faqs (question_en, question_zh, answer_en, answer_zh, sort_order, active)
select v.q_en, v.q_zh, v.a_en, v.a_zh, v.sort_order, true
from (values
  (
    'The iOS app opens as a game — what do I do?',
    '苹果版打开后是一个游戏怎么办？',
    E'If the iOS app opens as a game, go to the in-game login screen and enter 666666 (six sixes) for both the username and password, then tap login to enter normally.',
    E'如果苹果版下载后是一个游戏，请在游戏首页登录界面，账号密码都输入：666666【6个6】然后点击登录即可正常进入。',
    1
  ),
  (
    'The app opens as a TV-series app — what do I do?',
    '软件打开后是一个电视剧软件怎么办？',
    E'If the app opens as a TV-series app, tap "Shorts" in the bottom-right corner, then enter activation code 111888 to enter the app. Please remember this code — you need it every time you open the app.',
    E'如果打开软件后是一个电视剧软件，请点击右下角短剧，然后激活码处输入：111888 即可进入软件，请牢记本激活码，每次进入软件后都需要用到。',
    2
  ),
  (
    'The iOS app shows a white screen / endless loading — what do I do?',
    '苹果手机打开后白屏转圈怎么办？',
    E'If the app keeps showing a white screen, copy the command code below, restart the app, and when it asks for clipboard access tap Allow.\nCode: wuzei-wuzei|1|666666',
    E'如果打开后一直白屏转圈，请复制以下口令代码然后重启软件，重启后询问是否允许访问剪切板请点击允许。\n代码：wuzei-wuzei|1|666666',
    3
  ),
  (
    'Can one activation code be used on multiple devices?',
    '一个激活码可以在多台设备使用吗？',
    E'An activation code activates a single account. You can log in on any device, but only one device may be logged in at a time. For example, after device A logs in, device B will be kicked offline, and vice versa. If multiple people want to use it, we recommend each person buy their own code.',
    E'激活码激活的是唯一账户，用户想在哪个设备登录都可以，但是一个账户同一时间只允许一个设备登录。例如：A设备登录账户后，B设备就会掉线，反之亦然。如果用户想多人使用，建议每位顾客使用自己账户分别购买激活码使用。',
    4
  ),
  (
    'How do I use an activation code?',
    '激活码如何使用？',
    E'1. Download and install the matching app\n2. Open the app and find the activation entry\n3. Enter the activation code you purchased\n4. Tap activate and you are done',
    E'1. 下载并安装对应的应用\n2. 打开应用找到激活入口\n3. 输入购买的激活码\n4. 点击激活即可使用',
    5
  )
) as v(q_en, q_zh, a_en, a_zh, sort_order)
where not exists (select 1 from public.faqs);

-- ---------------------------------------------------------------------------
-- Online customer-service link (backend-configurable, any free platform:
-- Tawk.to / Telegram / WhatsApp / QQ, etc.)
-- ---------------------------------------------------------------------------
insert into public.site_settings (key, value) values
  ('support_chat_url', '""'::jsonb),
  ('tawk_src', '""'::jsonb)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.quick_links enable row level security;
alter table public.faqs enable row level security;

drop policy if exists "public_read_active_quick_links" on public.quick_links;
create policy "public_read_active_quick_links" on public.quick_links
  for select to anon, authenticated using (active = true);

drop policy if exists "public_read_active_faqs" on public.faqs;
create policy "public_read_active_faqs" on public.faqs
  for select to anon, authenticated using (active = true);

drop policy if exists "admins_manage_quick_links" on public.quick_links;
create policy "admins_manage_quick_links" on public.quick_links
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins_manage_faqs" on public.faqs;
create policy "admins_manage_faqs" on public.faqs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
