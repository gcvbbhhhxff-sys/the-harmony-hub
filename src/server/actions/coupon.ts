"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function validateCoupon(codigo: string, valor_pedido: number) {
  try {
    if (!codigo.trim()) {
      return { valid: false, message: "Cupom não informado." };
    }

    const adminDb = createAdminClient();
    const { data, error } = await adminDb.rpc("validar_cupom", { codigo: codigo.trim(), valor_pedido });

    if (error) {
      console.error("[validateCoupon]", error);
      return { valid: false, message: "Erro ao validar cupom." };
    }

    const row = (data as any)?.[0];
    if (!row?.valido) {
      return { valid: false, message: "Cupom inválido ou expirado." };
    }

    return { valid: true, tipo: row.tipo, valor: row.valor, desconto: row.desconto, message: "Cupom aplicado!" };
  } catch (error) {
    console.error("[validateCoupon]", error);
    return { valid: false, message: "Erro ao validar cupom." };
  }
}
