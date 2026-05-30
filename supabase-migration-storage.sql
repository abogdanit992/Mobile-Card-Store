-- Public storage bucket for admin-uploaded images (product covers, platform logos)
-- Run once in Supabase SQL Editor.

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

-- Public read for the media bucket
drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects
  for select
  using (bucket_id = 'media');

-- Admins can manage objects (uploads also work via service-role key, which
-- bypasses RLS — this policy lets the admin UI manage files if needed).
drop policy if exists "media admin write" on storage.objects;
create policy "media admin write" on storage.objects
  for all to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());
