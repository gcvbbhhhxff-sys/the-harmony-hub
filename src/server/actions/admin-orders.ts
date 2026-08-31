"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/server/admin";

async function guard() {
  const auth = await requireAdmin();
  if (!auth) {
    throw new Error("Não autorizado.");
  }
  return createClient();
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const db = await guard();
    
    const validStatuses = ["recebido", "preparando", "pronto", "saiu_para_entrega", "entregue", "cancelado"];
    if (!validStatuses.includes(status)) {
      return { ok: false, message: "Status inválido." };
    }

    const { error } = await db
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      console.error("[updateOrderStatus]", error);
      return { ok: false, message: "Erro ao atualizar status." };
    }

    await db.from("order_status_history").insert({ order_id: orderId, status });

    revalidatePath("/admin/pedidos");
    return { ok: true };
  } catch (error) {
    console.error("[updateOrderStatus]", error);
    return { ok: false, message: error instanceof Error ? error.message : "Erro ao atualizar status." };
  }
}
