-- Security hardening: lock down orders, cards, products (P0 RLS)
-- Run once in Supabase SQL Editor AFTER all prior migrations.
--
-- After this migration:
--   * Storefront order/card access ONLY via Next.js server (service role).
--   * Anon/authenticated clients cannot read card codes or mutate orders/products.
--   * Admin panel works via is_admin() policies when logged in.

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
drop policy if exists "products_insert_public" on public.products;
drop policy if exists "products_select_public" on public.products;
drop policy if exists "products_update_public" on public.products;
drop policy if exists "public_read_active_products" on public.products;
drop policy if exists "admins_manage_products" on public.products;

create policy "public_read_active_products"
  on public.products for select to anon, authenticated
  using (active = true);

create policy "admins_manage_products"
  on public.products for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Orders — no public access (server uses service role)
-- ---------------------------------------------------------------------------
drop policy if exists "orders_insert_public" on public.orders;
drop policy if exists "orders_select_public" on public.orders;
drop policy if exists "orders_update_public" on public.orders;
drop policy if exists "orders_select_by_contact_email" on public.orders;
drop policy if exists "admins_manage_orders" on public.orders;

create policy "admins_manage_orders"
  on public.orders for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Cards — no public access
-- ---------------------------------------------------------------------------
drop policy if exists "cards_select_public" on public.cards;
drop policy if exists "cards_update_public" on public.cards;
drop policy if exists "cards_insert_public" on public.cards;
drop policy if exists "cards_delete_admin" on public.cards;
drop policy if exists "admins_manage_cards" on public.cards;

create policy "admins_manage_cards"
  on public.cards for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Users — no public directory listing
-- ---------------------------------------------------------------------------
drop policy if exists "users_select_public" on public.users;
drop policy if exists "users_select_self" on public.users;
drop policy if exists "admins_read_users" on public.users;

create policy "users_select_self"
  on public.users for select to authenticated
  using (auth.uid() = id);

create policy "admins_read_users"
  on public.users for select to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Rate limiting (service role only — no client policies)
-- ---------------------------------------------------------------------------
create table if not exists public.api_rate_limits (
  id bigserial primary key,
  bucket text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_api_rate_limits_bucket_created
  on public.api_rate_limits (bucket, created_at desc);

alter table public.api_rate_limits enable row level security;
-- Intentionally no policies: only service_role can read/write.

-- ---------------------------------------------------------------------------
-- Admin audit log (service role writes; admins read in panel later)
-- ---------------------------------------------------------------------------
create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_email text not null,
  action text not null,
  detail jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_audit_log_created
  on public.admin_audit_log (created_at desc);

alter table public.admin_audit_log enable row level security;

drop policy if exists "admins_read_audit_log" on public.admin_audit_log;
create policy "admins_read_audit_log"
  on public.admin_audit_log for select to authenticated
  using (public.is_admin());

-- Inserts only via service role from server actions.
