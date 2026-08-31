"use server";

import { revalidatePath } from "next/cache";
import { getAdminDb } from "@/server/actions/admin-context";

export async function saveCategory(input: { id?: string; nome: string; ordem: number; ativo: boolean }) {
  const db = await getAdminDb();
  const nome = input.nome.trim();
  if (!nome || !Number.isInteger(input.ordem) || input.ordem < 0) return { ok: false, message: "Categoria inválida." } as const;

  const result = input.id
    ? await db.from("categories").update({ nome, ordem: input.ordem, ativo: input.ativo }).eq("id", input.id)
    : await db.from("categories").insert({ nome, ordem: input.ordem, ativo: input.ativo });

  if (result.error) return { ok: false, message: "Não foi possível salvar a categoria." } as const;
  revalidatePath("/");
  revalidatePath("/admin/cardapio");
  return { ok: true } as const;
}

export async function deleteCategory(id: string) {
  const db = await getAdminDb();
  const { data: products, error: productsError } = await db.from("products").select("id").eq("category_id", id).limit(1);
  if (productsError) return { ok: false, message: "Não foi possível verificar os produtos da categoria." } as const;
  if (products?.length) return { ok: false, message: "Não exclua uma categoria com produtos. Mova os produtos primeiro." } as const;

  const { error } = await db.from("categories").delete().eq("id", id);
  if (error) return { ok: false, message: "Não foi possível excluir a categoria." } as const;
  revalidatePath("/");
  revalidatePath("/admin/cardapio");
  return { ok: true } as const;
}
