-- Core tables for mobile card system
-- Run this in Supabase SQL Editor

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  cover text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  product_id uuid not null references public.products(id) on delete restrict,
  amount numeric(10,2) not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  code text not null unique,
  used boolean not null default false,
  used_order_id uuid references public.orders(id) on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_active_created_at
  on public.products(active, created_at desc);

create index if not exists idx_orders_product_status
  on public.orders(product_id, status);

create index if not exists idx_cards_product_used
  on public.cards(product_id, used);

-- Minimal seed data for product list page
insert into public.products (title, description, price, cover, active)
values
  ('Squid Monthly VIP', 'Monthly membership card', 35, null, true),
  ('Lemon Premium', 'Premium plan card', 49, null, true),
  ('Abalone Plus', 'Plus membership card', 59, null, true)
on conflict do nothing;
