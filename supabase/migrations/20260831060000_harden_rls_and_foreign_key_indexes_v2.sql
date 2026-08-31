-- Performance hardening for foreign-key joins and RLS init plans.
-- RLS remains enabled; this migration only adds indexes and caches auth.uid()
-- evaluation per statement where the policy result is user-specific.

create index if not exists idx_option_groups_product_id on public.option_groups(product_id);
create index if not exists idx_options_group_id on public.options(group_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);
create index if not exists idx_orders_address_id on public.orders(address_id);
create index if not exists idx_orders_coupon_id on public.orders(coupon_id);
create index if not exists idx_product_addons_addon_id on public.product_addons(addon_id);

drop index if exists public.restaurant_settings_singleton_idx;

alter policy customers_self_insert on public.customers
  with check ((select auth.uid()) = user_id);
alter policy customers_self_select on public.customers
  using ((select auth.uid()) = user_id);
alter policy customers_self_update on public.customers
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy addresses_self_delete on public.addresses
  using (exists (
    select 1 from public.customers c
    where c.id = addresses.customer_id
      and c.user_id = (select auth.uid())
  ));
alter policy addresses_self_insert on public.addresses
  with check (exists (
    select 1 from public.customers c
    where c.id = addresses.customer_id
      and c.user_id = (select auth.uid())
  ));
alter policy addresses_self_select on public.addresses
  using (exists (
    select 1 from public.customers c
    where c.id = addresses.customer_id
      and c.user_id = (select auth.uid())
  ));
alter policy addresses_self_update on public.addresses
  using (exists (
    select 1 from public.customers c
    where c.id = addresses.customer_id
      and c.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.customers c
    where c.id = addresses.customer_id
      and c.user_id = (select auth.uid())
  ));

alter policy orders_self_insert on public.orders
  with check (exists (
    select 1 from public.customers c
    where c.id = orders.customer_id
      and c.user_id = (select auth.uid())
  ));
alter policy orders_self_select on public.orders
  using (exists (
    select 1 from public.customers c
    where c.id = orders.customer_id
      and c.user_id = (select auth.uid())
  ));

alter policy order_items_self_insert on public.order_items
  with check (exists (
    select 1
    from public.orders o
    join public.customers c on c.id = o.customer_id
    where o.id = order_items.order_id
      and c.user_id = (select auth.uid())
  ));
alter policy order_items_self_select on public.order_items
  using (exists (
    select 1
    from public.orders o
    join public.customers c on c.id = o.customer_id
    where o.id = order_items.order_id
      and c.user_id = (select auth.uid())
  ));

alter policy status_history_self_insert on public.order_status_history
  with check (
    status = 'recebido'
    and exists (
      select 1
      from public.orders o
      join public.customers c on c.id = o.customer_id
      where o.id = order_status_history.order_id
        and c.user_id = (select auth.uid())
    )
  );
alter policy status_history_self_select on public.order_status_history
  using (exists (
    select 1
    from public.orders o
    join public.customers c on c.id = o.customer_id
    where o.id = order_status_history.order_id
      and c.user_id = (select auth.uid())
  ));

alter policy payments_self_select on public.payments
  using (exists (
    select 1
    from public.orders o
    join public.customers c on c.id = o.customer_id
    where o.id = payments.order_id
      and c.user_id = (select auth.uid())
  ));

alter policy admin_users_self_select on public.admin_users
  using (user_id = (select auth.uid()) or is_admin());
