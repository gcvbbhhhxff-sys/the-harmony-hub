import { createClient } from "@/lib/supabase/server";
import type { Category, Product, RestaurantSettings } from "@/types/menu";
import type { MenuAddon, MenuOption, MenuOptionGroup } from "@/types/cart";

const demoCategories: Category[] = [
  { id: "cat-churrascos", nome: "Churrascos", ordem: 1, ativo: true },
  { id: "cat-porcoes", nome: "Porções", ordem: 2, ativo: true },
  { id: "cat-acompanhamentos", nome: "Acompanhamentos", ordem: 3, ativo: true },
  { id: "cat-bebidas", nome: "Bebidas", ordem: 4, ativo: true },
];

const demoProducts: Product[] = [
  { id: "p-picanha", category_id: "cat-churrascos", nome: "Picanha na Brasa", descricao: "Picanha grelhada, ponto escolhido e finalizada na brasa.", preco: 59.9, imagem_url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85", ativo: true, destaque: true },
  { id: "p-ancho", category_id: "cat-churrascos", nome: "Ancho Grelhado", descricao: "Corte alto, suculento e servido bem quente.", preco: 69.9, imagem_url: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=900&q=85", ativo: true, destaque: false },
  { id: "p-espetinho", category_id: "cat-churrascos", nome: "Espetinho de Carne", descricao: "Espetinho de carne bovina temperada e grelhada.", preco: 24.9, imagem_url: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=900&q=85", ativo: true, destaque: false },
  { id: "p-batata", category_id: "cat-porcoes", nome: "Batata Rústica", descricao: "Batatas crocantes com ervas e molho da casa.", preco: 22.9, imagem_url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=85", ativo: true, destaque: false },
  { id: "p-mandioca", category_id: "cat-porcoes", nome: "Mandioca Frita", descricao: "Mandioca dourada e crocante, perfeita para compartilhar.", preco: 21.9, imagem_url: "https://images.unsplash.com/photo-1598679253544-2c97992403ea?auto=format&fit=crop&w=900&q=85", ativo: true, destaque: false },
  { id: "p-arroz", category_id: "cat-acompanhamentos", nome: "Arroz Branco", descricao: "Arroz soltinho preparado diariamente.", preco: 9.9, imagem_url: "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=900&q=85", ativo: true, destaque: false },
  { id: "p-tropeiro", category_id: "cat-acompanhamentos", nome: "Feijão Tropeiro", descricao: "Feijão tropeiro com bacon, ovos e tempero da casa.", preco: 17.9, imagem_url: "https://images.unsplash.com/photo-1542528180-1c2803fa048c?auto=format&fit=crop&w=900&q=85", ativo: true, destaque: false },
  { id: "p-refri", category_id: "cat-bebidas", nome: "Refrigerante Lata", descricao: "Lata 350 ml.", preco: 6.5, imagem_url: "https://images.unsplash.com/photo-1629203849820-fdd70d49c38e?auto=format&fit=crop&w=900&q=85", ativo: true, destaque: false },
  { id: "p-suco", category_id: "cat-bebidas", nome: "Suco Natural", descricao: "Suco natural preparado na hora.", preco: 10.9, imagem_url: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=85", ativo: true, destaque: false },
];

const demoSettings: RestaurantSettings = {
  nome: "Restaurante Tabajara's Churrascaria",
  logo_url: null,
  valor_minimo_pedido: 25,
  whatsapp: null,
  tempo_estimado: "40–60 minutos",
  horario_funcionamento: {
    segunda: { abertura: "11:00", fechamento: "22:30", ativo: true },
    terca: { abertura: "11:00", fechamento: "22:30", ativo: true },
    quarta: { abertura: "11:00", fechamento: "22:30", ativo: true },
    quinta: { abertura: "11:00", fechamento: "22:30", ativo: true },
    sexta: { abertura: "11:00", fechamento: "23:30", ativo: true },
    sabado: { abertura: "11:00", fechamento: "23:30", ativo: true },
    domingo: { abertura: "11:00", fechamento: "22:00", ativo: true },
  },
};

function normalizeSettings(value: unknown): RestaurantSettings | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const schedule = raw.horario_funcionamento as Record<string, unknown> | undefined;
  const normalizedSchedule: RestaurantSettings["horario_funcionamento"] = {};

  Object.entries(schedule ?? {}).forEach(([day, item]) => {
    if (!item || typeof item !== "object") return;
    const entry = item as Record<string, unknown>;
    const abertura = typeof entry.abertura === "string" ? entry.abertura : typeof entry.aberto === "string" ? entry.aberto : "";
    const fechamento = typeof entry.fechamento === "string" ? entry.fechamento : typeof entry.fechado === "string" ? entry.fechado : "";
    normalizedSchedule[day] = { abertura, fechamento, ativo: entry.ativo !== false };
  });

  return {
    nome: typeof raw.nome === "string" ? raw.nome : demoSettings.nome,
    logo_url: typeof raw.logo_url === "string" ? raw.logo_url : null,
    valor_minimo_pedido: Number(raw.valor_minimo_pedido ?? 0),
    whatsapp: typeof raw.whatsapp === "string" ? raw.whatsapp : null,
    tempo_estimado: typeof raw.tempo_estimado === "string" ? raw.tempo_estimado : demoSettings.tempo_estimado,
    horario_funcionamento: Object.keys(normalizedSchedule).length ? normalizedSchedule : demoSettings.horario_funcionamento,
  };
}

export async function getPublicMenu() {
  try {
    const supabase = await createClient();
    const [{ data: categories }, { data: products }, { data: settings }, { data: optionGroups }, { data: options }, { data: addons }, { data: productAddons }] = await Promise.all([
      supabase.from("categories").select("id,nome,ordem,ativo").eq("ativo", true).order("ordem"),
      supabase.from("products").select("id,category_id,nome,descricao,preco,imagem_url,ativo,destaque").eq("ativo", true).order("nome"),
      supabase.from("restaurant_settings").select("nome,logo_url,valor_minimo_pedido,whatsapp,tempo_estimado,horario_funcionamento").limit(1).maybeSingle(),
      supabase.from("option_groups").select("id,product_id,nome,min_select,max_select,obrigatorio,ordem").order("ordem"),
      supabase.from("options").select("id,group_id,nome,preco_extra,ordem,ativo").eq("ativo", true).order("ordem"),
      supabase.from("addons").select("id,nome,preco,ativo").eq("ativo", true).order("nome"),
      supabase.from("product_addons").select("product_id,addon_id"),
    ]);

    return {
      categories: (categories as Category[] | null) ?? [],
      products: (products as Product[] | null) ?? [],
      settings: normalizeSettings(settings) ?? demoSettings,
      optionGroups: (optionGroups as MenuOptionGroup[] | null) ?? [],
      options: (options as MenuOption[] | null) ?? [],
      addons: (addons as MenuAddon[] | null) ?? [],
      productAddons: (productAddons as { product_id: string; addon_id: string }[] | null) ?? [],
    };
  } catch {
    return {
      categories: demoCategories,
      products: demoProducts,
      settings: demoSettings,
      optionGroups: [] as MenuOptionGroup[],
      options: [] as MenuOption[],
      addons: [] as MenuAddon[],
      productAddons: [] as { product_id: string; addon_id: string }[],
    };
  }
}
