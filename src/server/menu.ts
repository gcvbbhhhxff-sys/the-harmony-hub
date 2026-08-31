import { createClient } from "@/lib/supabase/server";
import type { Category, Product, RestaurantSettings } from "@/types/menu";
import type { MenuAddon, MenuOption, MenuOptionGroup } from "@/types/cart";

const emptySchedule: RestaurantSettings["horario_funcionamento"] = {
  domingo: { abertura: "", fechamento: "", ativo: false },
  segunda: { abertura: "", fechamento: "", ativo: false },
  terca: { abertura: "", fechamento: "", ativo: false },
  quarta: { abertura: "", fechamento: "", ativo: false },
  quinta: { abertura: "", fechamento: "", ativo: false },
  sexta: { abertura: "", fechamento: "", ativo: false },
  sabado: { abertura: "", fechamento: "", ativo: false },
};

const fallbackSettings: RestaurantSettings = {
  nome: "Seu restaurante",
  logo_url: null,
  background_url: null,
  descricao: null,
  telefone: null,
  endereco: null,
  status_manual: "automatico",
  valor_minimo_pedido: 0,
  taxa_base_entrega: 0,
  whatsapp: null,
  tempo_estimado: null,
  chave_pix: null,
  horario_funcionamento: emptySchedule,
};

function normalizeSettings(value: unknown): RestaurantSettings {
  if (!value || typeof value !== "object") return fallbackSettings;
  const raw = value as Record<string, unknown>;
  const normalizedSchedule: RestaurantSettings["horario_funcionamento"] = {};

  if (raw.horario_funcionamento && typeof raw.horario_funcionamento === "object") {
    Object.entries(raw.horario_funcionamento as Record<string, unknown>).forEach(([day, item]) => {
      if (!item || typeof item !== "object") return;
      const entry = item as Record<string, unknown>;
      normalizedSchedule[day as keyof RestaurantSettings["horario_funcionamento"]] = {
        abertura: typeof entry.abertura === "string" ? entry.abertura : typeof entry.aberto === "string" ? entry.aberto : "",
        fechamento: typeof entry.fechamento === "string" ? entry.fechamento : typeof entry.fechado === "string" ? entry.fechado : "",
        ativo: entry.ativo === true,
      };
    });
  }

  return {
    ...fallbackSettings,
    nome: typeof raw.nome === "string" && raw.nome.trim() ? raw.nome : fallbackSettings.nome,
    logo_url: typeof raw.logo_url === "string" && raw.logo_url.trim() ? raw.logo_url : null,
    background_url: typeof raw.background_url === "string" && raw.background_url.trim() ? raw.background_url : null,
    descricao: typeof raw.descricao === "string" && raw.descricao.trim() ? raw.descricao : null,
    telefone: typeof raw.telefone === "string" && raw.telefone.trim() ? raw.telefone : null,
    endereco: typeof raw.endereco === "string" && raw.endereco.trim() ? raw.endereco : null,
    status_manual: raw.status_manual === "aberto" || raw.status_manual === "fechado" ? raw.status_manual : "automatico",
    valor_minimo_pedido: Number.isFinite(Number(raw.valor_minimo_pedido)) ? Number(raw.valor_minimo_pedido) : 0,
    taxa_base_entrega: Number.isFinite(Number(raw.taxa_base_entrega)) ? Number(raw.taxa_base_entrega) : 0,
    whatsapp: typeof raw.whatsapp === "string" && raw.whatsapp.trim() ? raw.whatsapp : null,
    tempo_estimado: typeof raw.tempo_estimado === "string" && raw.tempo_estimado.trim() ? raw.tempo_estimado : null,
    chave_pix: typeof raw.chave_pix === "string" && raw.chave_pix.trim() ? raw.chave_pix : null,
    horario_funcionamento: Object.keys(normalizedSchedule).length ? normalizedSchedule : emptySchedule,
  };
}

export async function getPublicMenu() {
  const supabase = await createClient();
  const [categoriesResult, productsResult, settingsResult, optionGroupsResult, optionsResult, addonsResult, productAddonsResult] = await Promise.all([
    supabase.from("categories").select("id,nome,ordem,ativo").eq("ativo", true).order("ordem"),
    supabase.from("products").select("id,category_id,nome,descricao,preco,imagem_url,ativo,destaque").eq("ativo", true).order("nome"),
    supabase.from("restaurant_settings").select("nome,logo_url,background_url,descricao,telefone,endereco,status_manual,taxa_base_entrega,valor_minimo_pedido,chave_pix,whatsapp,tempo_estimado,horario_funcionamento").limit(1).maybeSingle(),
    supabase.from("option_groups").select("id,product_id,nome,min_select,max_select,obrigatorio,ordem").order("ordem"),
    supabase.from("options").select("id,group_id,nome,preco_extra,ordem,ativo").eq("ativo", true).order("ordem"),
    supabase.from("addons").select("id,nome,preco,ativo").eq("ativo", true).order("nome"),
    supabase.from("product_addons").select("product_id,addon_id"),
  ]);

  const firstError = categoriesResult.error ?? productsResult.error ?? settingsResult.error ?? optionGroupsResult.error ?? optionsResult.error ?? addonsResult.error ?? productAddonsResult.error;
  if (firstError) {
    console.error("[getPublicMenu] Falha ao carregar o cardápio", firstError);
    throw new Error("Não foi possível carregar o cardápio.");
  }

  return {
    categories: (categoriesResult.data as Category[] | null) ?? [],
    products: (productsResult.data as Product[] | null) ?? [],
    settings: normalizeSettings(settingsResult.data),
    optionGroups: (optionGroupsResult.data as MenuOptionGroup[] | null) ?? [],
    options: (optionsResult.data as MenuOption[] | null) ?? [],
    addons: (addonsResult.data as MenuAddon[] | null) ?? [],
    productAddons: (productAddonsResult.data as { product_id: string; addon_id: string }[] | null) ?? [],
  };
}
