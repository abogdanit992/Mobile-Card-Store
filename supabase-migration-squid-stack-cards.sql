-- Squid (and any platform): optional “stack monthly codes” fulfillment.
-- When ON: quarterly → 3 monthly codes, annual → 12, monthly/trial → 1 (all from monthly SKU inventory).
-- When OFF: one code from the ordered product’s own inventory (legacy behavior).

alter table public.categories
  add column if not exists stack_monthly_codes boolean not null default false;

comment on column public.categories.stack_monthly_codes is
  'If true, fulfill quarterly/annual by issuing multiple monthly cards from the monthly product inventory.';

-- Enable for Squid (slug is lowercase after admin slugify: squid)
update public.categories
set stack_monthly_codes = true
where lower(slug) in ('squid', 'wuzei');
