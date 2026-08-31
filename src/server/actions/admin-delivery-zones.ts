"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/server/admin";

async function guard() {
  const auth = await requireAdmin();
  if (!auth || auth.admin.papel !== "admin") throw new Error("Não autorizado.");
  return createClient();
}

export async function saveDeliveryZone(input: { id?: string; nome: string; taxa: number; ativo: boolean }) {
  try {
    const db = await guard();
    const nome = input.nome.trim();
    if (!nome) return { ok: false, message: "Informe o bairro/zona." } as const;
    if (!Number.isFinite(input.taxa) || input.taxa < 0) return { ok: false, message: "Taxa inválida." } as const;

    const payload = { nome, taxa: Number(input.taxa), ativo: Boolean(input.ativo), is_demo: false };
    const result = input.id
      ? await db.from("delivery_zones").update(payload).eq("id", input.id)
      : await db.from("delivery_zones").insert(payload);

    if (result.error) return { ok: false, message: "Não foi possível salvar a zona de entrega." } as const;
    revalidatePath("/admin/zonas-de-entrega");
    return { ok: true, message: "Zona salva." } as const;
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Erro ao salvar a zona." } as const;
  }
}
