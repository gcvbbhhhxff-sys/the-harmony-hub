-- Demo/test data for the reusable delivery product.
-- Every demo row is flagged with is_demo=true so a future client can remove
-- demonstration content without touching real operational data.

alter table public.restaurant_settings add column if not exists is_demo boolean not null default false;
alter table public.categories add column if not exists is_demo boolean not null default false;
alter table public.products add column if not exists is_demo boolean not null default false;
alter table public.option_groups add column if not exists is_demo boolean not null default false;
alter table public.options add column if not exists is_demo boolean not null default false;
alter table public.addons add column if not exists is_demo boolean not null default false;
alter table public.product_addons add column if not exists is_demo boolean not null default false;
alter table public.delivery_zones add column if not exists is_demo boolean not null default false;
alter table public.coupons add column if not exists is_demo boolean not null default false;

create index if not exists idx_categories_demo on public.categories(is_demo);
create index if not exists idx_products_demo on public.products(is_demo);
create index if not exists idx_addons_demo on public.addons(is_demo);
create index if not exists idx_zones_demo on public.delivery_zones(is_demo);
create index if not exists idx_coupons_demo on public.coupons(is_demo);

create or replace function public.limpar_dados_demo()
returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.is_admin() then raise exception 'Apenas administradores podem limpar dados de demonstração'; end if;
  delete from public.product_addons where product_id in (select id from public.products where is_demo=true) or addon_id in (select id from public.addons where is_demo=true);
  delete from public.options where group_id in (select id from public.option_groups where is_demo=true);
  delete from public.option_groups where product_id in (select id from public.products where is_demo=true);
  delete from public.order_items where product_id in (select id from public.products where is_demo=true);
  delete from public.products where is_demo=true;
  delete from public.categories where is_demo=true;
  delete from public.addons where is_demo=true;
  delete from public.delivery_zones where is_demo=true;
  delete from public.coupons where is_demo=true;
  delete from public.restaurant_settings where is_demo=true;
end;
$$;

revoke all on function public.limpar_dados_demo() from public, anon, authenticated;
grant execute on function public.limpar_dados_demo() to service_role;
revoke all on function public.validar_cupom(text,numeric) from public, anon, authenticated;
grant execute on function public.validar_cupom(text,numeric) to service_role;

insert into public.restaurant_settings(nome,cor_primaria,cor_primaria_dark,cor_secundaria,cor_background,taxa_base_entrega,valor_minimo_pedido,chave_pix,whatsapp,tempo_estimado,horario_funcionamento,is_demo)
values('Restaurante Tabajara''s Churrascaria','#C9972A','#A67818','#0D0D0D','#FBF8F2',0,25,'pix-demo@tabajaras.local','5500000000000','40-60 minutos','{"segunda":{"aberto":"11:00","fechado":"22:30"},"terca":{"aberto":"11:00","fechado":"22:30"},"quarta":{"aberto":"11:00","fechado":"22:30"},"quinta":{"aberto":"11:00","fechado":"22:30"},"sexta":{"aberto":"11:00","fechado":"23:30"},"sabado":{"aberto":"11:00","fechado":"23:30"},"domingo":{"aberto":"11:00","fechado":"22:00"}}'::jsonb,true)
on conflict ((true)) do update set is_demo=true,atualizado_em=now();

insert into public.categories(nome,ordem,ativo,is_demo) values('Churrascos',1,true,true),('Porções',2,true,true),('Acompanhamentos',3,true,true),('Bebidas',4,true,true) on conflict do nothing;

insert into public.products(category_id,nome,descricao,preco,imagem_url,ativo,destaque,is_demo)
select c.id,v.nome,v.descricao,v.preco,v.imagem,true,v.destaque,true
from (values
('Churrascos','Picanha na Brasa','Picanha grelhada, ponto escolhido e finalizada na brasa.',59.90,'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85',true),
('Churrascos','Ancho Grelhado','Corte alto, suculento e servido bem quente.',69.90,'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=900&q=85',true),
('Churrascos','Espetinho de Carne','Espetinho de carne bovina temperada e grelhada.',24.90,'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=900&q=85',false),
('Porções','Batata Rústica','Batatas crocantes com ervas e molho da casa.',22.90,'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=85',false),
('Porções','Mandioca Frita','Mandioca dourada e crocante, perfeita para compartilhar.',21.90,'https://images.unsplash.com/photo-1598679253544-2c97992403ea?auto=format&fit=crop&w=900&q=85',false),
('Acompanhamentos','Arroz Branco','Arroz soltinho preparado diariamente.',9.90,'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=900&q=85',false),
('Acompanhamentos','Feijão Tropeiro','Feijão tropeiro com bacon, ovos e tempero da casa.',17.90,'https://images.unsplash.com/photo-1542528180-1c2803fa048c?auto=format&fit=crop&w=900&q=85',false),
('Bebidas','Refrigerante Lata','Lata 350 ml.',6.50,'https://images.unsplash.com/photo-1629203849820-fdd70d49c38e?auto=format&fit=crop&w=900&q=85',false),
('Bebidas','Suco Natural','Suco natural preparado na hora.',10.90,'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=85',false)
) v(categoria,nome,descricao,preco,imagem,destaque)
join public.categories c on c.nome=v.categoria and c.is_demo=true
where not exists(select 1 from public.products p where p.nome=v.nome and p.is_demo=true);

insert into public.option_groups(product_id,nome,min_select,max_select,obrigatorio,ordem,is_demo)
select p.id,'Ponto da carne',1,1,true,1,true from public.products p where p.nome='Picanha na Brasa' and p.is_demo=true and not exists(select 1 from public.option_groups g where g.product_id=p.id and g.nome='Ponto da carne');
insert into public.options(group_id,nome,preco_extra,ordem,ativo,is_demo)
select g.id,v.nome,0,v.ordem,true,true from public.option_groups g cross join (values('Mal passada',1),('Ao ponto',2),('Bem passada',3)) v(nome,ordem) where g.nome='Ponto da carne' and g.is_demo=true and not exists(select 1 from public.options o where o.group_id=g.id and o.nome=v.nome and o.is_demo=true);
insert into public.addons(nome,preco,ativo,is_demo) values('Farofa crocante',5.90,true,true),('Molho especial',3.90,true,true),('Queijo coalho',8.90,true,true) on conflict(nome) do update set preco=excluded.preco,ativo=true,is_demo=true,atualizado_em=now();
insert into public.product_addons(product_id,addon_id,is_demo) select p.id,a.id,true from public.products p cross join public.addons a where p.nome='Picanha na Brasa' and p.is_demo=true and a.is_demo=true on conflict(product_id,addon_id) do nothing;
insert into public.delivery_zones(nome,taxa,ativo,is_demo) values('Centro',6,true,true),('Jardim',8,true,true),('Vila Nova',10,true,true) on conflict(nome) do update set taxa=excluded.taxa,ativo=true,is_demo=true,atualizado_em=now();
insert into public.coupons(codigo,tipo,valor,pedido_minimo,limite_usos,validade,ativo,is_demo) values('DEMO10','percentual',10,30,999,now()+interval '90 days',true,true) on conflict(codigo) do update set tipo=excluded.tipo,valor=excluded.valor,pedido_minimo=excluded.pedido_minimo,limite_usos=excluded.limite_usos,validade=excluded.validade,ativo=true,is_demo=true,atualizado_em=now();
insert into storage.buckets(id,name,public) values('product-images','product-images',true) on conflict(id) do update set public=true;
drop policy if exists product_images_public_read on storage.objects; drop policy if exists product_images_admin_insert on storage.objects; drop policy if exists product_images_admin_update on storage.objects; drop policy if exists product_images_admin_delete on storage.objects;
create policy product_images_public_read on storage.objects for select using(bucket_id='product-images');
create policy product_images_admin_insert on storage.objects for insert with check(bucket_id='product-images' and public.is_admin());
create policy product_images_admin_update on storage.objects for update using(bucket_id='product-images' and public.is_admin()) with check(bucket_id='product-images' and public.is_admin());
create policy product_images_admin_delete on storage.objects for delete using(bucket_id='product-images' and public.is_admin());
