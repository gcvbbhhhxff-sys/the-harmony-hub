"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProductDetail } from "@/components/cliente/product-detail";
import { validateCoupon } from "@/server/actions/coupon";
import { cartTotal, useCartStore } from "@/lib/cart/store";
import type { MenuAddon, MenuOption, MenuOptionGroup } from "@/types/cart";

type Props = { optionGroups: MenuOptionGroup[]; options: MenuOption[]; addons: MenuAddon[]; productAddons: { product_id: string; addon_id: string }[]; minimumOrder: number };

export default function CartPageClient({ optionGroups, options, addons, productAddons, minimumOrder }: Props) {
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.removeItem);
  const [editing, setEditing] = useState<string | null>(null);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const total = cartTotal(items);
  const editingItem = items.find((item) => item.id === editing);

  const applyCoupon = () => startTransition(async () => {
    const result = await validateCoupon(coupon, total);
    if (!result.valid) {
      setDiscount(0);
      setCouponMessage(result.message || "Cupom inválido.");
      return;
    }
    setDiscount(result.desconto ?? 0);
    setCouponMessage(`Desconto aplicado: R$ ${(result.desconto ?? 0).toFixed(2).replace(".", ",")}`);
  });

  return (
    <main className="mx-auto max-w-3xl px-4 pb-28 pt-5 sm:px-6 sm:pt-7">
      <Link href="/" className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-[var(--color-muted)]"><ArrowLeft className="h-4 w-4" />Voltar ao cardápio</Link>
      <h1 className="mt-5 text-2xl font-black sm:text-3xl">Seu pedido</h1>
      {items.length === 0 ? <div className="py-16 text-center"><p className="text-sm text-[var(--color-muted)]">Seu carrinho está vazio.</p><Link href="/" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-secondary)] px-5 text-sm font-bold text-white">Ver cardápio</Link></div> : <div className="mt-5 grid gap-3">
        {items.map((item) => <Card key={item.id} className="border-black/5 p-4 shadow-[0_8px_24px_rgba(17,17,17,.04)]"><div className="flex gap-3"><div className="min-w-0 flex-1"><h2 className="font-bold">{item.product.nome}</h2><p className="mt-1 text-xs text-[var(--color-muted)]">R$ {item.unitPrice.toFixed(2).replace(".", ",")} por unidade</p>{item.options.length > 0 && <p className="mt-2 text-xs text-[var(--color-muted)]">{item.options.map((option) => option.nome).join(", ")}</p>}{item.addons.length > 0 && <p className="text-xs text-[var(--color-muted)]">+ {item.addons.map((addon) => addon.nome).join(", ")}</p>}<div className="mt-4 flex flex-wrap items-center gap-2"><Button size="sm" variant="outline" className="h-10 w-10 rounded-full p-0" aria-label={`Diminuir quantidade de ${item.product.nome}`} onClick={() => setQuantity(item.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button><span className="min-w-7 text-center text-sm font-bold" aria-live="polite">{item.quantity}</span><Button size="sm" variant="outline" className="h-10 w-10 rounded-full p-0" aria-label={`Aumentar quantidade de ${item.product.nome}`} onClick={() => setQuantity(item.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button><Button size="sm" variant="outline" className="min-h-10 rounded-full px-4" onClick={() => setEditing(item.id)}>Editar</Button><Button size="sm" variant="ghost" className="ml-auto h-10 w-10 rounded-full p-0" onClick={() => remove(item.id)} aria-label={`Remover ${item.product.nome} do pedido`}><Trash2 className="h-4 w-4" /></Button></div></div><strong className="shrink-0 text-sm font-black text-[var(--color-primary-dark)]">R$ {(item.unitPrice * item.quantity).toFixed(2).replace(".", ",")}</strong></div></Card>)}
        <Card className="border-black/5 p-4"><h2 className="font-bold">Cupom</h2><div className="mt-3 flex flex-col gap-2 sm:flex-row"><Input value={coupon} onChange={(event) => setCoupon(event.target.value.toUpperCase())} placeholder="Código" aria-label="Código do cupom" className="h-11" /><Button variant="outline" className="h-11 rounded-xl" disabled={pending} onClick={applyCoupon}>Aplicar</Button></div>{couponMessage && <p className="mt-2 text-sm">{couponMessage}</p>}</Card>
        <Card className="sticky bottom-3 z-20 border-black/5 bg-white/95 p-4 shadow-[0_16px_40px_rgba(17,17,17,.12)] backdrop-blur"><div className="flex items-center justify-between"><span>Subtotal</span><span className="font-bold">R$ {total.toFixed(2).replace(".", ",")}</span></div>{discount > 0 && <div className="mt-2 flex items-center justify-between text-sm text-[var(--color-success)]"><span>Desconto</span><span>- R$ {discount.toFixed(2).replace(".", ",")}</span></div>}{minimumOrder > 0 && total < minimumOrder && <p className="mt-3 text-sm text-[var(--color-danger)]">Pedido mínimo: R$ {minimumOrder.toFixed(2).replace(".", ",")}</p>}<Button size="lg" className="mt-4 h-12 w-full rounded-xl" disabled={minimumOrder > 0 && total < minimumOrder} onClick={() => { window.location.href = "/checkout"; }}>Continuar para checkout</Button></Card>
      </div>}
      {editingItem && <ProductDetail product={editingItem.product} groups={optionGroups.filter((group) => group.product_id === editingItem.product.id)} options={options} addons={addons} availableAddonIds={productAddons.filter((link) => link.product_id === editingItem.product.id).map((link) => link.addon_id)} existingItem={editingItem} open={Boolean(editing)} onClose={() => setEditing(null)} />}
    </main>
  );
}
