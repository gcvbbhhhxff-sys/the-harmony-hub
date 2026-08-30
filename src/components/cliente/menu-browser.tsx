"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Beef, ChevronRight, Clock3, Leaf, Search, ShoppingBag, Soup, Utensils, Wheat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { ProductDetail } from "@/components/cliente/product-detail";
import { cartTotal, useCartStore } from "@/lib/cart/store";
import type { MenuAddon, MenuOption, MenuOptionGroup } from "@/types/cart";
import type { Category, Product, RestaurantSettings } from "@/types/menu";

function getCategoryIcon(name: string) {
  const value = name.toLocaleLowerCase("pt-BR");
  if (value.includes("churrasc")) return Beef;
  if (value.includes("salada")) return Leaf;
  if (value.includes("feij")) return Soup;
  if (value.includes("arroz")) return Wheat;
  return Utensils;
}

function isOpenNow(now: Date, schedule: RestaurantSettings["horario_funcionamento"]) {
  const days = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
  const item = schedule?.[days[now.getDay()] || "domingo"];
  if (!item || item.ativo === false || !item.abertura || !item.fechamento) return false;
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return item.abertura <= time && time < item.fechamento;
}

function getNextOpening(now: Date, schedule: RestaurantSettings["horario_funcionamento"]) {
  const days = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(now);
    date.setDate(now.getDate() + offset);
    const item = schedule?.[days[date.getDay()] || "domingo"];
    if (item?.ativo !== false && item?.abertura) return item.abertura;
  }
  return null;
}

type Props = {
  categories: Category[];
  products: Product[];
  settings: RestaurantSettings;
  optionGroups: MenuOptionGroup[];
  options: MenuOption[];
  addons: MenuAddon[];
  productAddons: { product_id: string; addon_id: string }[];
};

export function MenuBrowser({ categories, products, settings, optionGroups, options, addons, productAddons }: Props) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(categories[0]?.id ?? "");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isCurrentlyOpen, setIsCurrentlyOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const total = cartTotal(items);

  useEffect(() => {
    const tick = () => setIsCurrentlyOpen(isOpenNow(new Date(), settings.horario_funcionamento));
    tick();
    const timer = window.setInterval(tick, 60_000);
    return () => window.clearInterval(timer);
  }, [settings.horario_funcionamento]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: [0.1, 0.35, 0.7] },
    );
    categories.forEach((category) => {
      const node = document.getElementById(category.id);
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, [categories]);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pt-BR");
    if (!term) return products;
    return products.filter((product) => `${product.nome} ${product.descricao ?? ""}`.toLocaleLowerCase("pt-BR").includes(term));
  }, [products, query]);

  const grouped = categories.map((category) => ({ category, items: filtered.filter((product) => product.category_id === category.id) })).filter((group) => group.items.length > 0);
  const opening = !isCurrentlyOpen ? getNextOpening(new Date(), settings.horario_funcionamento) : null;

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    setDetailOpen(true);
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)] pb-24">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-[68px] sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label={settings.nome}>
            <Logo size={44} className="shrink-0" />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-black tracking-[-0.01em]">{settings.nome}</p>
              <p className="truncate text-[10px] font-medium text-[var(--color-muted)]">Delivery oficial</p>
            </div>
          </Link>
          <Link href="/carrinho" aria-label="Abrir carrinho">
            <Button variant="outline" size="sm" className="gap-2 rounded-full border-black/10 bg-white px-3 shadow-sm">
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Meu pedido</span>
              {items.length > 0 && <span className="rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-xs font-black text-black">{items.length}</span>}
            </Button>
          </Link>
        </div>
      </header>

      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-6 sm:px-6 sm:py-8">
          <div className="min-w-0 max-w-3xl">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-primary-dark)]">Brasa • comida caseira • delivery</p>
            <h1 className="mt-2 text-2xl font-black leading-tight tracking-[-0.03em] text-[var(--color-secondary)] sm:text-4xl">Sabor de verdade, do jeito que você gosta.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-muted)] sm:text-base">Escolha seus pratos, personalize seu pedido e acompanhe tudo pelo celular.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[var(--color-background)] px-3 py-2 text-xs font-bold text-[var(--color-text)]"><span className={`h-2.5 w-2.5 rounded-full ${isCurrentlyOpen ? "bg-emerald-500" : "bg-red-500"}`} />{isCurrentlyOpen ? "Aberto agora" : opening ? `Abre às ${opening}` : "Fechado"}</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-[var(--color-muted)]"><Clock3 className="h-4 w-4" aria-hidden="true" />{settings.tempo_estimado || "40–60 min"}</span>
            </div>
          </div>
          <div className="hidden shrink-0 items-center gap-3 rounded-2xl border border-black/10 bg-[var(--color-background)] px-4 py-3 lg:flex">
            <Logo size={58} />
            <div><p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary-dark)]">Pedido online</p><p className="mt-1 text-xs text-[var(--color-muted)]">Rápido, simples e direto.</p></div>
          </div>
        </div>
      </section>

      <section className="sticky top-16 z-40 border-b border-black/10 bg-[var(--color-background)]/95 backdrop-blur sm:top-[68px]">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" aria-hidden="true" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar prato, carne, salada..." aria-label="Buscar no cardápio" className="h-11 rounded-xl border-black/10 bg-white pl-10 shadow-sm" /></div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Categorias do cardápio">
            {categories.map((category) => { const Icon = getCategoryIcon(category.nome); return <button key={category.id} type="button" onClick={() => document.getElementById(category.id)?.scrollIntoView({ behavior: "smooth", block: "start" })} className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full px-3.5 text-sm font-semibold ${active === category.id ? "bg-[var(--color-secondary)] text-white" : "bg-white text-[var(--color-text)] shadow-sm ring-1 ring-black/5"}`}><Icon className="h-4 w-4" aria-hidden="true" />{category.nome}</button>; })}
          </nav>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9">
        {grouped.map(({ category, items: categoryItems }) => (
          <section key={category.id} id={category.id} className="scroll-mt-32 py-2 sm:py-3">
            <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-primary-dark)]">Nossa seleção</p><h2 className="mt-1 text-xl font-black tracking-[-0.02em] sm:text-2xl">{category.nome}</h2></div><span className="hidden text-xs font-medium text-[var(--color-muted)] sm:block">{categoryItems.length} itens</span></div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categoryItems.map((product) => (
                <Card key={product.id} className="group overflow-hidden border-black/5 bg-white p-0 shadow-[0_8px_30px_rgba(17,17,17,.045)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(17,17,17,.08)]">
                  <button type="button" className="flex w-full items-stretch text-left sm:block" onClick={() => openProduct(product)}>
                    <div className="relative h-28 w-28 shrink-0 overflow-hidden bg-[var(--color-surface-soft)] sm:h-44 sm:w-full">
                      {product.imagem_url ? <Image src={product.imagem_url} alt={product.nome} fill sizes="(max-width: 640px) 112px, (max-width: 1024px) 50vw, 25vw" className="object-cover transition duration-300 group-hover:scale-[1.025]" unoptimized /> : <div className="flex h-full items-center justify-center bg-[var(--color-surface-soft)] text-[var(--color-primary-dark)]"><Utensils className="h-8 w-8" aria-hidden="true" /></div>}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between p-3 sm:p-4"><div><div className="flex items-start justify-between gap-3"><h3 className="text-sm font-extrabold leading-5 sm:text-base">{product.nome}</h3><span className="shrink-0 text-sm font-black text-[var(--color-primary-dark)]">R$ {product.preco.toFixed(2).replace(".", ",")}</span></div>{product.descricao && <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--color-muted)]">{product.descricao}</p>}</div><div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[var(--color-secondary)]"><span>{isCurrentlyOpen ? "Personalizar" : "Ver detalhes"}</span><ChevronRight className="h-4 w-4" aria-hidden="true" /></div></div>
                  </button>
                  <div className="hidden px-4 pb-4 sm:block"><Button className="w-full rounded-xl" disabled={!isCurrentlyOpen} onClick={() => openProduct(product)}>{isCurrentlyOpen ? "Adicionar ao pedido" : "Restaurante fechado"}</Button></div>
                </Card>
              ))}
            </div>
          </section>
        ))}
        {grouped.length === 0 && <div className="rounded-2xl border border-dashed border-black/10 bg-white p-10 text-center"><Search className="mx-auto h-8 w-8 text-[var(--color-muted)]" aria-hidden="true" /><h2 className="mt-3 font-bold">Nada encontrado</h2><p className="mt-1 text-sm text-[var(--color-muted)]">Tente outro termo ou escolha uma categoria.</p></div>}
      </div>

      <footer className="border-t border-black/10 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-7 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><p className="font-bold">{settings.nome}</p><p className="mt-1 text-xs text-[var(--color-muted)]">Configure o conteúdo do restaurante pelo painel administrativo.</p></div><div className="flex items-center gap-4 text-xs text-[var(--color-muted)]">{settings.whatsapp && <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="font-semibold text-[var(--color-secondary)]">WhatsApp</a>}<Link href="/politica-de-privacidade">Privacidade</Link></div></div></footer>

      <div className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:right-6 sm:w-auto"><Link href="/carrinho" className="block"><Button size="lg" className="w-full min-w-[min(92vw,22rem)] justify-between rounded-2xl bg-[var(--color-secondary)] px-4 text-white shadow-[0_12px_32px_rgba(0,0,0,.22)] hover:bg-black sm:min-w-[18rem]"><span className="flex items-center gap-2"><ShoppingBag className="h-5 w-5" aria-hidden="true" />{items.length ? `${items.length} ${items.length === 1 ? "item" : "itens"}` : "Seu pedido"}</span><span>R$ {total.toFixed(2).replace(".", ",")}</span></Button></Link></div>

      {selectedProduct && <ProductDetail product={selectedProduct} groups={optionGroups.filter((group) => group.product_id === selectedProduct.id)} options={options} addons={addons} availableAddonIds={productAddons.filter((link) => link.product_id === selectedProduct.id).map((link) => link.addon_id)} open={detailOpen} onClose={() => setDetailOpen(false)} />}
    </main>
  );
}
