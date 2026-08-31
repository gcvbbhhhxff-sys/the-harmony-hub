"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/server/admin";

async function guard() {
  const auth = await requireAdmin();
  if (!auth || auth.admin.papel !== "admin") throw new Error("Não autorizado.");
  return createClient();
}

export async function saveOptionGroup(input: { id?: string; product_id: string; nome: string; min_select: number; max_select: number; obrigatorio: boolean; ordem: number }) {
  const db = await guard();
  const nome = input.nome.trim();
  const valid = Boolean(input.product_id) && Boolean(nome) && Number.isInteger(input.min_select) && Number.isInteger(input.max_select) && input.min_select >= 0 && input.max_select >= input.min_select && Number.isInteger(input.ordem) && input.ordem >= 0;
  if (!valid) return { ok: false, message: "Grupo inválido." } as const;

  const { data: product } = await db.from("products").select("id").eq("id", input.product_id).maybeSingle();
  if (!product) return { ok: false, message: "Produto inválido." } as const;

  const payload = { product_id: input.product_id, nome, min_select: input.min_select, max_select: input.max_select, obrigatorio: input.obrigatorio, ordem: input.ordem };
  const result = input.id ? await db.from("option_groups").update(payload).eq("id", input.id) : await db.from("option_groups").insert(payload);
  if (result.error) return { ok: false, message: "Não foi possível salvar o grupo." } as const;

  revalidatePath("/");
  return { ok: true } as const;
}

export async function deleteOptionGroup(id: string) {
  const db = await guard();
  const { error } = await db.from("option_groups").delete().eq("id", id);
  if (error) return { ok: false, message: "Não foi possível excluir o grupo." } as const;
  revalidatePath("/");
  return { ok: true } as const;
}

export async function saveOption(input: { id?: string; group_id: string; nome: string; preco_extra: number; ordem: number; ativo: boolean }) {
  const db = await guard();
  const nome = input.nome.trim();
  const valid = Boolean(input.group_id) && Boolean(nome) && Number.isFinite(input.preco_extra) && input.preco_extra >= 0 && Number.isInteger(input.ordem) && input.ordem >= 0;
  if (!valid) return { ok: false, message: "Opção inválida." } as const;

  const { data: group } = await db.from("option_groups").select("id").eq("id", input.group_id).maybeSingle();
  if (!group) return { ok: false, message: "Grupo inválido." } as const;

  const payload = { group_id: input.group_id, nome, preco_extra: input.preco_extra, ordem: input.ordem, ativo: input.ativo };
  const result = input.id ? await db.from("options").update(payload).eq("id", input.id) : await db.from("options").insert(payload);
  if (result.error) return { ok: false, message: "Não foi possível salvar a opção." } as const;

  revalidatePath("/");
  return { ok: true } as const;
}

export async function deleteOption(id: string) {
  const db = await guard();
  const { error } = await db.from("options").delete().eq("id", id);
  if (error) return { ok: false, message: "Não foi possível excluir a opção." } as const;
  revalidatePath("/");
  return { ok: true } as const;
}
