-- Additional policies for admin orders/cards/users pages
-- Run after existing RLS scripts

alter table public.users enable row level security;
alter table public.orders enable row level security;
alter table public.cards enable row level security;

drop policy if exists "users_select_public" on public.users;
create policy "users_select_public"
on public.users
for select
to anon, authenticated
using (true);

drop policy if exists "cards_insert_public" on public.cards;
create policy "cards_insert_public"
on public.cards
for insert
to anon, authenticated
with check (true);
