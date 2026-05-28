-- Seed unused card inventory for demo flow
-- Run after products exist

insert into public.cards (product_id, code, used)
select p.id, v.code, false
from public.products p
join (
  values
    ('Squid Monthly VIP', 'SQUID-2026-0001'),
    ('Squid Monthly VIP', 'SQUID-2026-0002'),
    ('Lemon Premium', 'LEMON-2026-0001'),
    ('Lemon Premium', 'LEMON-2026-0002'),
    ('Abalone Plus', 'ABALONE-2026-0001')
) as v(title, code)
  on v.title = p.title
on conflict (code) do nothing;
