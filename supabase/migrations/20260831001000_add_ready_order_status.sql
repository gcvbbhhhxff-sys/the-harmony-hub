ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status = ANY (ARRAY['recebido'::text,'preparando'::text,'pronto'::text,'saiu_para_entrega'::text,'entregue'::text,'cancelado'::text]));

ALTER TABLE public.order_status_history DROP CONSTRAINT IF EXISTS order_status_history_status_check;
ALTER TABLE public.order_status_history ADD CONSTRAINT order_status_history_status_check CHECK (status = ANY (ARRAY['recebido'::text,'preparando'::text,'pronto'::text,'saiu_para_entrega'::text,'entregue'::text,'cancelado'::text]));
