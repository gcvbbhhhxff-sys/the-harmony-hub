-- Production hardening for TABAJARAS-DELIVERY.
-- Run after supabase/schema.sql when provisioning a fresh environment.

create unique index if not exists addresses_one_default_per_customer
  on public.addresses(customer_id)
  where padrao = true;

create policy coupons_admin_all
  on public.coupons
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists orders_self_insert on public.orders;
drop policy if exists order_items_self_insert on public.order_items;

revoke all on function public.is_admin() from public, anon, authenticated;
revoke all on function public.prevent_customer_order_status_change() from public, anon, authenticated;
revoke execute on function public.consumir_cupom(text, numeric) from public, anon, authenticated;
revoke execute on function public.validar_cupom(text, numeric) from public;
grant execute on function public.validar_cupom(text, numeric) to anon, authenticated;
grant execute on function public.consumir_cupom(text, numeric) to service_role;

insert into public.restaurant_settings(nome, cor_primaria, cor_primaria_dark, cor_secundaria, cor_background, tempo_estimado)
values ('Restaurante Tabajara''s Churrascaria', '#D3A328', '#AA7F18', '#121212', '#F7F5F1', '40-60 minutos')
on conflict do nothing;

insert into storage.buckets(id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy product_images_public_read
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy product_images_admin_insert
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

create policy product_images_admin_update
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy product_images_admin_delete
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_rel pr
      join pg_class c on c.oid = pr.prrelid
      join pg_publication p on p.oid = pr.prpubid
      where p.pubname = 'supabase_realtime' and c.oid = 'public.orders'::regclass
    ) then
      execute 'alter publication supabase_realtime add table public.orders';
    end if;

    if not exists (
      select 1 from pg_publication_rel pr
      join pg_class c on c.oid = pr.prrelid
      join pg_publication p on p.oid = pr.prpubid
      where p.pubname = 'supabase_realtime' and c.oid = 'public.order_status_history'::regclass
    ) then
      execute 'alter publication supabase_realtime add table public.order_status_history';
    end if;
  end if;
end $$;
