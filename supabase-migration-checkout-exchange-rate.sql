-- Expose exchange_rate (non-secret) on storefront payment channel view.
create or replace view public.payment_channels_public as
  select
    id,
    provider,
    label_en,
    label_zh,
    enabled,
    sort_order,
    nullif(trim(config->>'exchange_rate'), '') as exchange_rate
  from public.payment_channels
  where enabled = true;

grant select on public.payment_channels_public to anon, authenticated;
