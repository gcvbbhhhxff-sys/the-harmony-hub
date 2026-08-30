-- Limpeza de dados DEMO
-- Esta migration remove todos os dados comerciais de teste (is_demo=true)
-- preservando a estrutura do banco e as funções de segurança

-- Desabilitar triggers temporariamente
ALTER TABLE order_items DISABLE TRIGGER ALL;
ALTER TABLE orders DISABLE TRIGGER ALL;
ALTER TABLE order_status_history DISABLE TRIGGER ALL;
ALTER TABLE product_addons DISABLE TRIGGER ALL;
ALTER TABLE products DISABLE TRIGGER ALL;
ALTER TABLE categories DISABLE TRIGGER ALL;
ALTER TABLE addons DISABLE TRIGGER ALL;
ALTER TABLE options DISABLE TRIGGER ALL;
ALTER TABLE option_groups DISABLE TRIGGER ALL;
ALTER TABLE coupons DISABLE TRIGGER ALL;
ALTER TABLE delivery_zones DISABLE TRIGGER ALL;
ALTER TABLE addresses DISABLE TRIGGER ALL;
ALTER TABLE customers DISABLE TRIGGER ALL;

-- Limpar dados comerciais de teste
DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE is_demo = true);
DELETE FROM order_status_history WHERE order_id IN (SELECT id FROM orders WHERE is_demo = true);
DELETE FROM payments WHERE order_id IN (SELECT id FROM orders WHERE is_demo = true);
DELETE FROM orders WHERE is_demo = true;
DELETE FROM addresses WHERE customer_id IN (SELECT id FROM customers WHERE is_demo = true);
DELETE FROM customers WHERE is_demo = true;
DELETE FROM product_addons WHERE product_id IN (SELECT id FROM products WHERE is_demo = true);
DELETE FROM option_groups WHERE product_id IN (SELECT id FROM products WHERE is_demo = true);
DELETE FROM products WHERE is_demo = true;
DELETE FROM categories WHERE is_demo = true;
DELETE FROM addons WHERE is_demo = true;
DELETE FROM coupons WHERE is_demo = true;
DELETE FROM delivery_zones WHERE is_demo = true;

-- Limpar configurações de teste
DELETE FROM restaurant_settings WHERE is_demo = true;

-- Reabilitar triggers
ALTER TABLE order_items ENABLE TRIGGER ALL;
ALTER TABLE orders ENABLE TRIGGER ALL;
ALTER TABLE order_status_history ENABLE TRIGGER ALL;
ALTER TABLE product_addons ENABLE TRIGGER ALL;
ALTER TABLE products ENABLE TRIGGER ALL;
ALTER TABLE categories ENABLE TRIGGER ALL;
ALTER TABLE addons ENABLE TRIGGER ALL;
ALTER TABLE options ENABLE TRIGGER ALL;
ALTER TABLE option_groups ENABLE TRIGGER ALL;
ALTER TABLE coupons ENABLE TRIGGER ALL;
ALTER TABLE delivery_zones ENABLE TRIGGER ALL;
ALTER TABLE addresses ENABLE TRIGGER ALL;
ALTER TABLE customers ENABLE TRIGGER ALL;
