-- Run after schema creation when RLS is enabled

alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.cards enable row level security;

-- Public can read only active products for storefront
drop policy if exists "public_read_active_products" on public.products;
create policy "public_read_active_products"
on public.products
for select
to anon, authenticated
using (active = true);

-- Keep sensitive tables blocked for now (no anon policies)
-- We'll open/write policies later with auth/order flow.

-- Seed active products (safe to run multiple times)
insert into public.products (title, description, price, cover, active)
values
  ('Squid Monthly VIP', 'Monthly membership card', 35, null, true),
  ('Lemon Premium', 'Premium plan card', 49, null, true),
  ('Abalone Plus', 'Plus membership card', 59, null, true);
