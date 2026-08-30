import { createClient } from "@/lib/supabase/server";
import type { Category, Product, RestaurantSettings } from "@/types/menu";
import type { MenuAddon, MenuOption, MenuOptionGroup } from "@/types/cart";

const fallbackSettings: RestaurantSettings = {
  nome: "Seu Restaurante",
  logo_url: null,
  background_url: null,
  valor_minimo_pedido: 0,
  whatsapp: null,
  tempo_estimado: "30–45 minutos",
  horario_funcionamento: {
    domingo: { abertura: "11:00", fechamento: "23:00", ativo: true },
    segunda: { abertura: "11:00", fechamento: "23:00", ativo: true },
    terca: { abertura: "11:00", fechamento: "23:00", ativo: true },
    quarta: { abertura: "11:00", fechamento: "23:00", ativo: true },
    quinta: { abertura: "11:00", fechamento: "23:00", ativo: true },
    sexta: { abertura: "11:00", fechamento: "00:00", ativo: true },
    sabado: { abertura: "11:00", fechamento: "00:00", ativo: true },
  },
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
        abertura:
          typeof entry.abertura === "string"
            ? entry.abertura
            : typeof entry.aberto === "string"
              ? entry.aberto
              : "",
        fechamento:
          typeof entry.fechamento === "string"
            ? entry.fechamento
            : typeof entry.fechado === "string"
              ? entry.fechado
              : "",
        ativo: entry.ativo !== false,
      };
    });
  }

  return {
    ...fallbackSettings,
    nome: typeof raw.nome === "string" ? raw.nome : fallbackSettings.nome,
    logo_url: typeof raw.logo_url === "string" ? raw.logo_url : null,
    background_url: typeof raw.background_url === "string" ? raw.background_url : null,
    valor_minimo_pedido: Number(raw.valor_minimo_pedido ?? 0),
    whatsapp: typeof raw.whatsapp === "string" ? raw.whatsapp : null,
    tempo_estimado: typeof raw.tempo_estimado === "string" ? raw.tempo_estimado : fallbackSettings.tempo_estimado,
    horario_funcionamento: Object.keys(normalizedSchedule).length ? normalizedSchedule : fallbackSettings.horario_funcionamento,
  };
}

export async function getPublicMenu() {
  const supabase = await createClient();

  const [categoriesResult, productsResult, settingsResult, optionGroupsResult, optionsResult, addonsResult, productAddonsResult] =
    await Promise.all([
      supabase.from("categories").select("id,nome,ordem,ativo").eq("ativo", true).order("ordem"),
      supabase.from("products").select("id,category_id,nome,descricao,preco,imagem_url,ativo,destaque").eq("ativo", true).order("nome"),
      supabase.from("restaurant_settings").select("nome,logo_url,background_url,valor_minimo_pedido,whatsapp,tempo_estimado,horario_funcionamento").limit(1).maybeSingle(),
      supabase.from("option_groups").select("id,product_id,nome,min_select,max_select,obrigatorio,ordem").order("ordem"),
      supabase.from("options").select("id,group_id,nome,preco_extra,ordem,ativo").eq("ativo", true).order("ordem"),
      supabase.from("addons").select("id,nome,preco,ativo").eq("ativo", true).order("nome"),
      supabase.from("product_addons").select("product_id,addon_id"),
    ]);

  const firstError =
    categoriesResult.error ??
    productsResult.error ??
    settingsResult.error ??
    optionGroupsResult.error ??
    optionsResult.error ??
    addonsResult.error ??
    productAddonsResult.error;

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
