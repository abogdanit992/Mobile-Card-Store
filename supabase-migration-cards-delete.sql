-- Allow admins to delete card inventory (enables "Delete card" + "Clear" buttons)
-- Without this policy, RLS silently blocks deletes (0 rows removed, no error).
-- Run once in Supabase SQL Editor.

drop policy if exists "cards_delete_admin" on public.cards;
create policy "cards_delete_admin" on public.cards
  for delete to authenticated
  using (public.is_admin());
