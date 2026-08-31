"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/server/admin";

async function guard() {
  const auth = await requireAdmin();
  if (!auth || auth.admin.papel !== "admin") {
    throw new Error("Não autorizado.");
  }
  return createClient();
}

export async function saveRestaurantSettings(form: any) {
  try {
    const db = await guard();
    
    const { error } = await db
      .from("restaurant_settings")
      .upsert({
        nome: form.nome || "Seu Restaurante",
        logo_url: form.logo_url || null,
        background_url: form.background_url || null,
        taxa_base_entrega: Number(form.taxa_base_entrega ?? 0),
        valor_minimo_pedido: Number(form.valor_minimo_pedido ?? 0),
        chave_pix: form.chave_pix || null,
        whatsapp: form.whatsapp || null,
        tempo_estimado: form.tempo_estimado || "30–45 minutos",
        horario_funcionamento: form.horario_funcionamento || {},
      });

    if (error) {
      console.error("[saveRestaurantSettings]", error);
      return { ok: false, message: "Erro ao salvar configurações." };
    }

    revalidatePath("/");
    return { ok: true, message: "Configurações salvas." };
  } catch (error) {
    console.error("[saveRestaurantSettings]", error);
    return { ok: false, message: error instanceof Error ? error.message : "Erro ao salvar configurações." };
  }
}

export async function uploadRestaurantLogo(formData: FormData) {
  try {
    await guard();
    
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { ok: false, message: "Arquivo inválido." };
    }

    const adminDb = createAdminClient();
    const fileName = `logo-${Date.now()}.${file.name.split(".").pop()}`;
    
    const { error: uploadError } = await adminDb.storage
      .from("restaurant-assets")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error("[uploadRestaurantLogo]", uploadError);
      return { ok: false, message: "Erro ao fazer upload da logo." };
    }

    const { data } = adminDb.storage.from("restaurant-assets").getPublicUrl(fileName);
    const url = data?.publicUrl;

    if (!url) {
      return { ok: false, message: "Erro ao obter URL da logo." };
    }

    const db = await createClient();
    const { error: updateError } = await db
      .from("restaurant_settings")
      .update({ logo_url: url });

    if (updateError) {
      console.error("[uploadRestaurantLogo]", updateError);
      return { ok: false, message: "Erro ao salvar logo." };
    }

    revalidatePath("/");
    return { ok: true, url };
  } catch (error) {
    console.error("[uploadRestaurantLogo]", error);
    return { ok: false, message: error instanceof Error ? error.message : "Erro ao fazer upload." };
  }
}

export async function uploadRestaurantBackground(formData: FormData) {
  try {
    await guard();
    
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { ok: false, message: "Arquivo inválido." };
    }

    const adminDb = createAdminClient();
    const fileName = `background-${Date.now()}.${file.name.split(".").pop()}`;
    
    const { error: uploadError } = await adminDb.storage
      .from("restaurant-assets")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error("[uploadRestaurantBackground]", uploadError);
      return { ok: false, message: "Erro ao fazer upload da imagem." };
    }

    const { data } = adminDb.storage.from("restaurant-assets").getPublicUrl(fileName);
    const url = data?.publicUrl;

    if (!url) {
      return { ok: false, message: "Erro ao obter URL da imagem." };
    }

    const db = await createClient();
    const { error: updateError } = await db
      .from("restaurant_settings")
      .update({ background_url: url });

    if (updateError) {
      console.error("[uploadRestaurantBackground]", updateError);
      return { ok: false, message: "Erro ao salvar imagem." };
    }

    revalidatePath("/");
    return { ok: true, url };
  } catch (error) {
    console.error("[uploadRestaurantBackground]", error);
    return { ok: false, message: error instanceof Error ? error.message : "Erro ao fazer upload." };
  }
}
