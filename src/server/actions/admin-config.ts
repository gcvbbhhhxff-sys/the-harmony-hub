"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminDb } from "@/server/actions/admin-context";
import { saveCoupon as saveCouponAction } from "@/server/actions/admin-coupons";
import { saveDeliveryZone as saveDeliveryZoneAction } from "@/server/actions/admin-delivery-zones";

export async function saveCoupon(...args: Parameters<typeof saveCouponAction>) {
  return saveCouponAction(...args);
}

export async function saveDeliveryZone(...args: Parameters<typeof saveDeliveryZoneAction>) {
  return saveDeliveryZoneAction(...args);
}

type SettingsForm = {
  id?: string;
  nome: string;
  logo_url: string;
  background_url: string;
  descricao: string;
  telefone: string;
  endereco: string;
  status_manual: "automatico" | "aberto" | "fechado";
  taxa_base_entrega: number;
  valor_minimo_pedido: number;
  chave_pix: string;
  whatsapp: string;
  tempo_estimado: string;
  horario_funcionamento: Record<string, { abertura: string; fechamento: string; ativo: boolean }>;
};

type UploadResult = { ok: true; url: string; message?: string } | { ok: false; message: string };

const DEFAULT_SETTINGS = {
  nome: "Seu restaurante",
  logo_url: null,
  background_url: null,
  descricao: null,
  telefone: null,
  endereco: null,
  status_manual: "automatico" as const,
  taxa_base_entrega: 0,
  valor_minimo_pedido: 0,
  chave_pix: null,
  whatsapp: null,
  tempo_estimado: null,
  horario_funcionamento: {},
};

async function getSettingsId(db: Awaited<ReturnType<typeof createClient>>) {
  const { data, error } = await db.from("restaurant_settings").select("id").limit(1).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function ensureSettingsRow(db: Awaited<ReturnType<typeof createClient>>) {
  const id = await getSettingsId(db);
  if (id) return id;

  const { data, error } = await db.from("restaurant_settings").insert(DEFAULT_SETTINGS).select("id").single();
  if (error || !data) throw error ?? new Error("Não foi possível criar as configurações.");
  return data.id as string;
}

function validateSettings(form: SettingsForm) {
  const nome = form.nome.trim();
  if (!nome) return { ok: false as const, message: "Informe o nome do restaurante." };
  if (!Number.isFinite(Number(form.taxa_base_entrega)) || Number(form.taxa_base_entrega) < 0) return { ok: false as const, message: "Taxa de entrega inválida." };
  if (!Number.isFinite(Number(form.valor_minimo_pedido)) || Number(form.valor_minimo_pedido) < 0) return { ok: false as const, message: "Pedido mínimo inválido." };
  return { ok: true as const, nome };
}

function buildSettingsPayload(form: SettingsForm) {
  return {
    nome: form.nome.trim(),
    logo_url: form.logo_url.trim() || null,
    background_url: form.background_url.trim() || null,
    descricao: form.descricao.trim() || null,
    telefone: form.telefone.trim() || null,
    endereco: form.endereco.trim() || null,
    status_manual: form.status_manual,
    taxa_base_entrega: Number(form.taxa_base_entrega),
    valor_minimo_pedido: Number(form.valor_minimo_pedido),
    chave_pix: form.chave_pix.trim() || null,
    whatsapp: form.whatsapp.trim() || null,
    tempo_estimado: form.tempo_estimado.trim() || null,
    horario_funcionamento: form.horario_funcionamento ?? {},
  };
}

export async function saveRestaurantSettings(form: SettingsForm) {
  try {
    const db = await getAdminDb();
    const validation = validateSettings(form);
    if (!validation.ok) return validation;

    const id = form.id ?? (await getSettingsId(db));
    const payload = buildSettingsPayload(form);
    const result = id
      ? await db.from("restaurant_settings").update(payload).eq("id", id)
      : await db.from("restaurant_settings").insert(payload);

    if (result.error) {
      console.error("[saveRestaurantSettings]", result.error);
      return { ok: false, message: "Erro ao salvar configurações." } as const;
    }

    revalidatePath("/");
    revalidatePath("/admin/configuracoes");
    return { ok: true, message: "Configurações salvas." } as const;
  } catch (error) {
    console.error("[saveRestaurantSettings]", error);
    return { ok: false, message: error instanceof Error ? error.message : "Erro ao salvar configurações." } as const;
  }
}

function validateImage(file: File) {
  const allowed = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);
  if (!allowed.has(file.type)) return "Formato de imagem não permitido. Use PNG, JPEG, WEBP ou SVG.";
  if (file.size > 5 * 1024 * 1024) return "A imagem deve ter no máximo 5 MB.";
  return null;
}

async function uploadRestaurantAsset(db: Awaited<ReturnType<typeof createClient>>, file: File, folder: "logo" | "background"): Promise<UploadResult> {
  const validationError = validateImage(file);
  if (validationError) return { ok: false, message: validationError };

  const settingsId = await ensureSettingsRow(db);
  const ext = file.name.split(".").pop()?.toLowerCase() || (folder === "logo" ? "png" : "jpg");
  const fileName = `${folder}/${crypto.randomUUID()}.${ext}`;
  const bucket = db.storage.from("restaurant-assets");
  const upload = await bucket.upload(fileName, file, { upsert: false, contentType: file.type, cacheControl: "3600" });

  if (upload.error) {
    console.error(`[uploadRestaurantAsset:${folder}]`, upload.error);
    return { ok: false, message: `Erro ao fazer upload ${folder === "logo" ? "da logo" : "da imagem de fundo"}.` };
  }

  const url = bucket.getPublicUrl(fileName).data.publicUrl;
  const updateField = folder === "logo" ? { logo_url: url } : { background_url: url };
  const { error: updateError } = await db.from("restaurant_settings").update(updateField).eq("id", settingsId);

  if (updateError) {
    console.error(`[uploadRestaurantAsset:${folder}]`, updateError);
    await bucket.remove([fileName]);
    return {
      ok: false,
      message: `Upload concluído, mas não foi possível salvar ${folder === "logo" ? "a logo" : "a imagem de fundo"} no restaurante.`,
    };
  }

  revalidatePath("/");
  revalidatePath("/admin/configuracoes");
  return { ok: true, url };
}

async function uploadAsset(formData: FormData, folder: "logo" | "background") {
  const db = await getAdminDb();
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, message: "Arquivo inválido." } as const;
  return uploadRestaurantAsset(db, file, folder);
}

export async function uploadRestaurantLogo(formData: FormData): Promise<UploadResult> {
  try {
    return await uploadAsset(formData, "logo");
  } catch (error) {
    console.error("[uploadRestaurantLogo]", error);
    return { ok: false, message: error instanceof Error ? error.message : "Erro ao fazer upload da logo." };
  }
}

export async function uploadRestaurantBackground(formData: FormData): Promise<UploadResult> {
  try {
    return await uploadAsset(formData, "background");
  } catch (error) {
    console.error("[uploadRestaurantBackground]", error);
    return { ok: false, message: error instanceof Error ? error.message : "Erro ao fazer upload da imagem de fundo." };
  }
}
