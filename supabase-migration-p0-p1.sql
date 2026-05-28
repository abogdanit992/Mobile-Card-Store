-- P0/P1: contact fields, admin allowlist, user phone profile
-- Run in Supabase SQL Editor after existing scripts

alter table public.orders
  add column if not exists contact_email text,
  add column if not exists contact_phone text;

alter table public.users
  add column if not exists phone text;

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_contact_email
  on public.orders (lower(contact_email));

create index if not exists idx_orders_contact_phone
  on public.orders (contact_phone);

-- Seed your admin email (change to yours)
insert into public.admins (email)
values ('your-admin@example.com')
on conflict (email) do nothing;

alter table public.admins enable row level security;

drop policy if exists "admins_select_authenticated" on public.admins;
create policy "admins_select_authenticated"
on public.admins
for select
to authenticated
using (lower(email) = lower(auth.jwt() ->> 'email'));

-- Allow reading own orders by contact email (order lookup)
drop policy if exists "orders_select_by_contact_email" on public.orders;
create policy "orders_select_by_contact_email"
on public.orders
for select
to anon, authenticated
using (true);

-- Sync auth user -> public.users on first login (optional helper)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, phone)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        phone = coalesce(excluded.phone, public.users.phone);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
