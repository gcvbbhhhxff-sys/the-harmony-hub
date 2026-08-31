"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/server/admin";

async function guard() {
  const auth = await requireAdmin();
  if (!auth || auth.admin.papel !== "admin") throw new Error("Não autorizado.");
  return createClient();
}

export async function saveProduct(input: { id?: string; category_id: string; nome: string; descricao?: string; preco: number; imagem_url?: string | null; ativo: boolean; destaque: boolean }) {
  const db = await guard();
  const nome = input.nome.trim();
  if (!input.category_id || !nome || !Number.isFinite(input.preco) || input.preco < 0) return { ok: false, message: "Nome, categoria e preço válidos são obrigatórios." } as const;

  const { data: category, error: categoryError } = await db.from("categories").select("id").eq("id", input.category_id).maybeSingle();
  if (categoryError) return { ok: false, message: "Não foi possível validar a categoria." } as const;
  if (!category) return { ok: false, message: "Categoria inválida." } as const;

  const payload = {
    category_id: input.category_id,
    nome,
    descricao: input.descricao?.trim() || null,
    preco: input.preco,
    imagem_url: input.imagem_url?.trim() || null,
    ativo: input.ativo,
    destaque: input.destaque,
  };

  const result = input.id
    ? await db.from("products").update(payload).eq("id", input.id)
    : await db.from("products").insert(payload).select("id").single();

  if (result.error) return { ok: false, message: "Não foi possível salvar o produto." } as const;
  revalidatePath("/");
  revalidatePath("/admin/cardapio");
  return { ok: true, id: input.id ?? (result.data as { id: string } | null)?.id } as const;
}

export async function toggleProduct(id: string, ativo: boolean) {
  const db = await guard();
  const { error } = await db.from("products").update({ ativo }).eq("id", id);
  if (error) return { ok: false, message: "Não foi possível alterar a disponibilidade do produto." } as const;
  revalidatePath("/");
  return { ok: true } as const;
}

export async function deleteProduct(id: string) {
  const db = await guard();
  const { error } = await db.from("products").delete().eq("id", id);
  if (error) return { ok: false, message: "Não foi possível excluir o produto." } as const;
  revalidatePath("/");
  revalidatePath("/admin/cardapio");
  return { ok: true } as const;
}

export async function uploadProductImage(formData: FormData) {
  const db = await guard();
  const file = formData.get("file");
  const productId = formData.get("productId");

  if (!(file instanceof File) || typeof productId !== "string") return { ok: false, message: "Arquivo inválido." } as const;
  if (!productId) return { ok: false, message: "Produto inválido." } as const;

  const { data: product } = await db.from("products").select("id").eq("id", productId).maybeSingle();
  if (!product) return { ok: false, message: "Produto inválido." } as const;

  const allowed = new Set(["image/png", "image/jpeg", "image/webp"]);
  if (!allowed.has(file.type) || file.size > 5 * 1024 * 1024) return { ok: false, message: "Imagem inválida. Use PNG, JPEG ou WEBP com até 5 MB." } as const;

  const admin = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${productId}/${crypto.randomUUID()}.${ext}`;
  const bucket = admin.storage.from("product-images");
  const upload = await bucket.upload(path, file, { contentType: file.type, upsert: false });
  if (upload.error) return { ok: false, message: "Não foi possível enviar a imagem." } as const;

  const url = bucket.getPublicUrl(path).data.publicUrl;
  const { error } = await db.from("products").update({ imagem_url: url }).eq("id", productId);
  if (error) return { ok: false, message: "Imagem enviada, mas não foi possível vinculá-la ao produto." } as const;

  revalidatePath("/");
  revalidatePath("/admin/cardapio");
  return { ok: true, url } as const;
}
