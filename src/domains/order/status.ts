export const ORDER_STATUSES = ["recebido", "preparando", "pronto", "saiu_para_entrega", "entregue", "cancelado"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export function requiresCancellationReason(status: OrderStatus) {
  return status === "cancelado";
}
