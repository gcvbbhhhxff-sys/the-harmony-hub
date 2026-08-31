"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/server/admin";

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
type UploadResult={ok:true;url:string;message?:string}|{ok:false;message:string};

const defaultSettings = {
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

async function guard() {
  const auth = await requireAdmin();
  if (!auth || auth.admin.papel !== "admin") throw new Error("Não autorizado.");
  return createClient();
}

async function getSettingsId(db: Awaited<ReturnType<typeof createClient>>) {
  const { data, error } = await db.from("restaurant_settings").select("id").limit(1).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function ensureSettingsRow(db: Awaited<ReturnType<typeof createClient>>) {
  const id = await getSettingsId(db);
  if (id) return id;
  const { data, error } = await db.from("restaurant_settings").insert(defaultSettings).select("id").single();
  if (error || !data) throw error ?? new Error("Não foi possível criar as configurações.");
  return data.id as string;
}

export async function saveRestaurantSettings(form: SettingsForm) {
  try {
    const db = await guard();
    const cleanName = form.nome.trim();
    if (!cleanName) return { ok: false, message: "Informe o nome do restaurante." } as const;
    if (!Number.isFinite(Number(form.taxa_base_entrega)) || Number(form.taxa_base_entrega) < 0) return { ok: false, message: "Taxa de entrega inválida." } as const;
    if (!Number.isFinite(Number(form.valor_minimo_pedido)) || Number(form.valor_minimo_pedido) < 0) return { ok: false, message: "Pedido mínimo inválido." } as const;

    const payload = {
      nome: cleanName,
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

    const id = form.id ?? (await getSettingsId(db));
    const result = id ? await db.from("restaurant_settings").update(payload).eq("id", id) : await db.from("restaurant_settings").insert(payload);
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

async function validateImage(file: File) {
  const allowed = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);
  if (!allowed.has(file.type)) return "Formato de imagem não permitido. Use PNG, JPEG, WEBP ou SVG.";
  if (file.size > 5 * 1024 * 1024) return "A imagem deve ter no máximo 5 MB.";
  return null;
}

async function uploadRestaurantAsset(db: Awaited<ReturnType<typeof createClient>>, file: File, folder: "logo" | "background"): Promise<UploadResult> {
  const validationError = await validateImage(file);
  if (validationError) return { ok: false, message: validationError };
  const settingsId = await ensureSettingsRow(db);
  const ext = file.name.split(".").pop()?.toLowerCase() || (folder === "logo" ? "png" : "jpg");
  const fileName = `${folder}/${crypto.randomUUID()}.${ext}`;
  const upload = await db.storage.from("restaurant-assets").upload(fileName, file, { upsert: false, contentType: file.type, cacheControl: "3600" });
  if (upload.error) {
    console.error(`[uploadRestaurantAsset:${folder}]`, upload.error);
    return { ok: false, message: `Erro ao fazer upload ${folder === "logo" ? "da logo" : "da imagem de fundo"}.` };
  }
  const url = db.storage.from("restaurant-assets").getPublicUrl(fileName).data.publicUrl;
  const { error: updateError } = await db.from("restaurant_settings").update(folder === "logo" ? { logo_url: url } : { background_url: url }).eq("id", settingsId);
  if (updateError) {
    console.error(`[uploadRestaurantAsset:${folder}]`, updateError);
    await db.storage.from("restaurant-assets").remove([fileName]);
    return { ok: false, message: `Upload concluído, mas não foi possível salvar ${folder === "logo" ? "a logo" : "a imagem de fundo"} no restaurante.` };
  }
  revalidatePath("/");
  revalidatePath("/admin/configuracoes");
  return { ok: true, url };
}

export async function uploadRestaurantLogo(formData: FormData): Promise<UploadResult> {
  try {
    const db = await guard();
    const file = formData.get("file");
    if (!(file instanceof File)) return { ok: false, message: "Arquivo inválido." };
    return await uploadRestaurantAsset(db, file, "logo");
  } catch (error) {
    console.error("[uploadRestaurantLogo]", error);
    return { ok: false, message: error instanceof Error ? error.message : "Erro ao fazer upload da logo." };
  }
}

export async function uploadRestaurantBackground(formData: FormData): Promise<UploadResult> {
  try {
    const db = await guard();
    const file = formData.get("file");
    if (!(file instanceof File)) return { ok: false, message: "Arquivo inválido." };
    return await uploadRestaurantAsset(db, file, "background");
  } catch (error) {
    console.error("[uploadRestaurantBackground]", error);
    return { ok: false, message: error instanceof Error ? error.message : "Erro ao fazer upload da imagem de fundo." };
  }
}

export async function saveCoupon(input:{id?:string;codigo:string;tipo:"percentual"|"fixo";valor:number;pedido_minimo:number;limite_usos:number|null;validade:string;ativo:boolean}){
 try{
  const db=await guard();
  const codigo=input.codigo.trim().toUpperCase();
  if(!codigo)return{ok:false,message:"Informe o código do cupom."};
  if(!Number.isFinite(input.valor)||input.valor<0)return{ok:false,message:"Valor do cupom inválido."};
  if(input.tipo==="percentual"&&input.valor>100)return{ok:false,message:"O percentual não pode ultrapassar 100%."};
  if(!Number.isFinite(input.pedido_minimo)||input.pedido_minimo<0)return{ok:false,message:"Pedido mínimo inválido."};
  if(input.limite_usos!==null&&(!Number.isInteger(input.limite_usos)||input.limite_usos<1))return{ok:false,message:"Limite de usos inválido."};
  const payload={codigo,tipo:input.tipo,valor:Number(input.valor),pedido_minimo:Number(input.pedido_minimo),limite_usos:input.limite_usos,validade:input.validade?new Date(input.validade).toISOString():null,ativo:Boolean(input.ativo),is_demo:false};
  const result=input.id?await db.from("coupons").update(payload).eq("id",input.id):await db.from("coupons").insert(payload);
  if(result.error)return{ok:false,message:"Não foi possível salvar o cupom."};
  revalidatePath("/admin/cupons");
  return{ok:true,message:"Cupom salvo."};
 }catch(error){return{ok:false,message:error instanceof Error?error.message:"Erro ao salvar o cupom."};}
}

export async function saveDeliveryZone(input:{id?:string;nome:string;taxa:number;ativo:boolean}){
 try{
  const db=await guard();
  const nome=input.nome.trim();
  if(!nome)return{ok:false,message:"Informe o bairro/zona."};
  if(!Number.isFinite(input.taxa)||input.taxa<0)return{ok:false,message:"Taxa inválida."};
  const payload={nome,taxa:Number(input.taxa),ativo:Boolean(input.ativo),is_demo:false};
  const result=input.id?await db.from("delivery_zones").update(payload).eq("id",input.id):await db.from("delivery_zones").insert(payload);
  if(result.error)return{ok:false,message:"Não foi possível salvar a zona de entrega."};
  revalidatePath("/admin/zonas-de-entrega");
  return{ok:true,message:"Zona salva."};
 }catch(error){return{ok:false,message:error instanceof Error?error.message:"Erro ao salvar a zona."};}
}
