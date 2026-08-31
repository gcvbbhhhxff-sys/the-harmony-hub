"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/server/admin";

async function guard() {
  const auth = await requireAdmin();
  if (!auth || auth.admin.papel !== "admin") throw new Error("Não autorizado.");
  return createClient();
}

export async function saveAddon(input: { id?: string; nome: string; preco: number; ativo: boolean }) {
  const db = await guard();
  const nome = input.nome.trim();
  if (!nome || !Number.isFinite(input.preco) || input.preco < 0) return { ok: false, message: "Adicional inválido." } as const;

  const payload = { nome, preco: input.preco, ativo: input.ativo };
  const result = input.id ? await db.from("addons").update(payload).eq("id", input.id) : await db.from("addons").insert(payload);
  if (result.error) return { ok: false, message: "Não foi possível salvar o adicional." } as const;

  revalidatePath("/");
  return { ok: true } as const;
}

export async function deleteAddon(id: string) {
  const db = await guard();
  const { error: linkError } = await db.from("product_addons").delete().eq("addon_id", id);
  if (linkError) return { ok: false, message: "Não foi possível remover os vínculos do adicional." } as const;

  const { error } = await db.from("addons").delete().eq("id", id);
  if (error) return { ok: false, message: "Não foi possível excluir o adicional." } as const;

  revalidatePath("/");
  return { ok: true } as const;
}

async function ensureReferences(db: Awaited<ReturnType<typeof createClient>>, productId: string, addonId: string) {
  const [{ data: product }, { data: addon }] = await Promise.all([
    db.from("products").select("id").eq("id", productId).maybeSingle(),
    db.from("addons").select("id").eq("id", addonId).maybeSingle(),
  ]);
  return { product, addon };
}

export async function linkAddon(productId: string, addonId: string) {
  const db = await guard();
  const { product, addon } = await ensureReferences(db, productId, addonId);
  if (!product || !addon) return { ok: false, message: "Produto ou adicional inválido." } as const;

  const { error } = await db.from("product_addons").upsert({ product_id: productId, addon_id: addonId });
  if (error) return { ok: false, message: "Não foi possível associar o adicional." } as const;
  revalidatePath("/");
  return { ok: true } as const;
}

export async function unlinkAddon(productId: string, addonId: string) {
  const db = await guard();
  const { error } = await db.from("product_addons").delete().eq("product_id", productId).eq("addon_id", addonId);
  if (error) return { ok: false, message: "Não foi possível remover o vínculo." } as const;
  revalidatePath("/");
  return { ok: true } as const;
}
