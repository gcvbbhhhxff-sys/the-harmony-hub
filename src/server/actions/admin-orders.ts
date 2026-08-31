"use server";

import { revalidatePath } from "next/cache";
import { isOrderStatus, requiresCancellationReason, type OrderStatus } from "@/domains/order/status";
import { getAdminDb } from "@/server/actions/admin-context";

export async function updateOrderStatus(orderId: string, status: string, reason?: string) {
  try {
    const db = await getAdminDb();
    if (!isOrderStatus(status)) return { ok: false, message: "Status inválido." } as const;
    if (requiresCancellationReason(status) && !reason?.trim()) return { ok: false, message: "Informe o motivo do cancelamento." } as const;

    const { error } = await db.from("orders").update({ status }).eq("id", orderId);
    if (error) {
      console.error("[updateOrderStatus]", error);
      return { ok: false, message: "Erro ao atualizar status." } as const;
    }

    const { error: historyError } = await db.from("order_status_history").insert({
      order_id: orderId,
      status,
      motivo_cancelamento: reason?.trim() || null,
    });
    if (historyError) {
      console.error("[updateOrderStatus/history]", historyError);
      return { ok: false, message: "Status atualizado, mas não foi possível registrar o histórico." } as const;
    }

    revalidatePath("/admin/pedidos");
    return { ok: true, status: status as OrderStatus } as const;
  } catch (error) {
    console.error("[updateOrderStatus]", error);
    return { ok: false, message: error instanceof Error ? error.message : "Erro ao atualizar status." } as const;
  }
}
