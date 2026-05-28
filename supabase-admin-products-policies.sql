-- Admin products policies for MVP dashboard actions
-- Run this after RLS is enabled

alter table public.products enable row level security;

drop policy if exists "products_insert_public" on public.products;
create policy "products_insert_public"
on public.products
for insert
to anon, authenticated
with check (true);

drop policy if exists "products_select_public" on public.products;
create policy "products_select_public"
on public.products
for select
to anon, authenticated
using (true);

drop policy if exists "products_update_public" on public.products;
create policy "products_update_public"
on public.products
for update
to anon, authenticated
using (true)
with check (true);
