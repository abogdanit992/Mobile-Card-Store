-- Policies for checkout -> payment -> card delivery flow
-- Run this after supabase-rls-and-seed.sql

alter table public.orders enable row level security;
alter table public.cards enable row level security;

-- Orders: allow anon/auth users to create and read orders (MVP scope)
drop policy if exists "orders_insert_public" on public.orders;
create policy "orders_insert_public"
on public.orders
for insert
to anon, authenticated
with check (true);

drop policy if exists "orders_select_public" on public.orders;
create policy "orders_select_public"
on public.orders
for select
to anon, authenticated
using (true);

drop policy if exists "orders_update_public" on public.orders;
create policy "orders_update_public"
on public.orders
for update
to anon, authenticated
using (true)
with check (true);

-- Cards: allow reading delivery card and claiming an unused card
drop policy if exists "cards_select_public" on public.cards;
create policy "cards_select_public"
on public.cards
for select
to anon, authenticated
using (true);

drop policy if exists "cards_update_public" on public.cards;
create policy "cards_update_public"
on public.cards
for update
to anon, authenticated
using (true)
with check (true);
