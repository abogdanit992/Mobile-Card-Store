-- Platform branding + category filter (run after schema + seed)
-- Maps storefront ?sort=1|2|3|5 to product rows (same as vipfkk.com categories)

alter table public.products
  add column if not exists category_sort text;

update public.products set category_sort = '1', title = '乌贼月卡', cover = 'http://vipfkk.com/content/uploadfile/202512/3d401765465207.png'
where title ilike '%squid%' or title ilike '%乌贼%';

update public.products set category_sort = '3', title = '柠檬月卡', cover = 'http://vipfkk.com/content/uploadfile/202512/aa591765466150.png'
where title ilike '%lemon%' or title ilike '%柠檬%';

update public.products set category_sort = '2', title = '鲍鱼月卡', cover = 'http://vipfkk.com/content/uploadfile/202512/af8c1765465348.png'
where title ilike '%abalone%' or title ilike '%鲍鱼%';

insert into public.products (title, description, price, cover, active, category_sort)
select '懂你月卡', '懂你聚合盒子月卡', 35,
  'http://vipfkk.com/content/uploadfile/202601/3fa11769080520.png',
  true, '5'
where not exists (
  select 1 from public.products where category_sort = '5' or title ilike '%懂你%'
);

create index if not exists idx_products_category_sort
  on public.products(category_sort)
  where active = true;
