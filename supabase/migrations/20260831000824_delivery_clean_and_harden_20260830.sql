-- Clean the new delivery database while preserving auth/admin infrastructure.
DELETE FROM public.order_status_history;
DELETE FROM public.order_items;
DELETE FROM public.payments;
DELETE FROM public.orders;
DELETE FROM public.addresses;
DELETE FROM public.customers;
DELETE FROM public.product_addons;
DELETE FROM public.options;
DELETE FROM public.option_groups;
DELETE FROM public.products;
DELETE FROM public.categories;
DELETE FROM public.addons;
DELETE FROM public.coupons;
DELETE FROM public.delivery_zones;
DELETE FROM public.restaurant_settings;

ALTER TABLE public.restaurant_settings
  ADD COLUMN IF NOT EXISTS descricao text,
  ADD COLUMN IF NOT EXISTS telefone text,
  ADD COLUMN IF NOT EXISTS endereco text,
  ADD COLUMN IF NOT EXISTS status_manual text NOT NULL DEFAULT 'automatico';

ALTER TABLE public.restaurant_settings
  DROP CONSTRAINT IF EXISTS restaurant_settings_status_manual_check;
ALTER TABLE public.restaurant_settings
  ADD CONSTRAINT restaurant_settings_status_manual_check
  CHECK (status_manual IN ('automatico','aberto','fechado'));

CREATE UNIQUE INDEX IF NOT EXISTS restaurant_settings_singleton_idx
  ON public.restaurant_settings ((true));

DROP POLICY IF EXISTS orders_self_insert ON public.orders;
CREATE POLICY orders_self_insert
  ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = orders.customer_id AND c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS order_items_self_insert ON public.order_items;
CREATE POLICY order_items_self_insert
  ON public.order_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.customers c ON c.id = o.customer_id
      WHERE o.id = order_items.order_id AND c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS status_history_self_insert ON public.order_status_history;
CREATE POLICY status_history_self_insert
  ON public.order_status_history
  FOR INSERT TO authenticated
  WITH CHECK (
    status = 'recebido'
    AND EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.customers c ON c.id = o.customer_id
      WHERE o.id = order_status_history.order_id AND c.user_id = auth.uid()
    )
  );

CREATE SCHEMA IF NOT EXISTS private;
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid() AND papel = 'admin'
  );
$$;
REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT private.is_admin();
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', true, 5242880, ARRAY['image/png','image/jpeg','image/webp']::text[]),
  ('restaurant-assets', 'restaurant-assets', true, 5242880, ARRAY['image/png','image/jpeg','image/webp','image/svg+xml']::text[])
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS product_images_public_read ON storage.objects;
CREATE POLICY product_images_public_read ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');
DROP POLICY IF EXISTS product_images_admin_insert ON storage.objects;
CREATE POLICY product_images_admin_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());
DROP POLICY IF EXISTS product_images_admin_update ON storage.objects;
CREATE POLICY product_images_admin_update ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());
DROP POLICY IF EXISTS product_images_admin_delete ON storage.objects;
CREATE POLICY product_images_admin_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS restaurant_assets_public_read ON storage.objects;
CREATE POLICY restaurant_assets_public_read ON storage.objects FOR SELECT
  USING (bucket_id = 'restaurant-assets');
DROP POLICY IF EXISTS restaurant_assets_admin_insert ON storage.objects;
CREATE POLICY restaurant_assets_admin_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'restaurant-assets' AND public.is_admin());
DROP POLICY IF EXISTS restaurant_assets_admin_update ON storage.objects;
CREATE POLICY restaurant_assets_admin_update ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'restaurant-assets' AND public.is_admin())
  WITH CHECK (bucket_id = 'restaurant-assets' AND public.is_admin());
DROP POLICY IF EXISTS restaurant_assets_admin_delete ON storage.objects;
CREATE POLICY restaurant_assets_admin_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'restaurant-assets' AND public.is_admin());
