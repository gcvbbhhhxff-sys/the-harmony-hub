"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/server/admin";

async function guard() {
  const auth = await requireAdmin();
  if (!auth || auth.admin.papel !== "admin") throw new Error("Não autorizado.");
  return createClient();
}

export async function saveCoupon(input: { id?: string; codigo: string; tipo: "percentual" | "fixo"; valor: number; pedido_minimo: number; limite_usos: number | null; validade: string; ativo: boolean }) {
  try {
    const db = await guard();
    const codigo = input.codigo.trim().toUpperCase();
    if (!codigo) return { ok: false, message: "Informe o código do cupom." } as const;
    if (!Number.isFinite(input.valor) || input.valor < 0) return { ok: false, message: "Valor do cupom inválido." } as const;
    if (input.tipo === "percentual" && input.valor > 100) return { ok: false, message: "O percentual não pode ultrapassar 100%." } as const;
    if (!Number.isFinite(input.pedido_minimo) || input.pedido_minimo < 0) return { ok: false, message: "Pedido mínimo inválido." } as const;
    if (input.limite_usos !== null && (!Number.isInteger(input.limite_usos) || input.limite_usos < 1)) return { ok: false, message: "Limite de usos inválido." } as const;

    const payload = {
      codigo,
      tipo: input.tipo,
      valor: Number(input.valor),
      pedido_minimo: Number(input.pedido_minimo),
      limite_usos: input.limite_usos,
      validade: input.validade ? new Date(input.validade).toISOString() : null,
      ativo: Boolean(input.ativo),
      is_demo: false,
    };

    const result = input.id
      ? await db.from("coupons").update(payload).eq("id", input.id)
      : await db.from("coupons").insert(payload);

    if (result.error) return { ok: false, message: "Não foi possível salvar o cupom." } as const;
    revalidatePath("/admin/cupons");
    return { ok: true, message: "Cupom salvo." } as const;
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Erro ao salvar o cupom." } as const;
  }
}
