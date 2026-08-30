"use client";

import { useMemo, useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useCartStore } from "@/lib/cart/store";
import type { Product } from "@/types/menu";
import type { CartAddon, CartItem, CartSelection, MenuAddon, MenuOption, MenuOptionGroup } from "@/types/cart";

type Props = {
  product: Product;
  groups: MenuOptionGroup[];
  options: MenuOption[];
  addons: MenuAddon[];
  availableAddonIds: string[];
  open: boolean;
  onClose: () => void;
};

export function ProductDetail({ product, groups, options, addons, availableAddonIds, open, onClose }: Props) {
  const addItem = useCartStore((state) => state.addItem);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [observation, setObservation] = useState("");
  const [quantity, setQuantity] = useState(1);

  const chosenOptions: CartSelection[] = Object.entries(selected).flatMap(([groupId, ids]) =>
    ids.flatMap((id) => {
      const option = options.find((item) => item.id === id);
      return option ? [{ optionId: option.id, groupId, nome: option.nome, precoExtra: option.preco_extra }] : [];
    }),
  );

  const chosenAddons: CartAddon[] = selectedAddons.flatMap((id) => {
    const addon = addons.find((item) => item.id === id);
    return addon ? [{ addonId: addon.id, nome: addon.nome, preco: addon.preco }] : [];
  });

  const valid = groups.every((group) => {
    const count = selected[group.id]?.length ?? 0;
    return count >= group.min_select && count <= group.max_select;
  });

  const unitPrice = useMemo(
    () => product.preco + chosenOptions.reduce((sum, option) => sum + option.precoExtra, 0) + chosenAddons.reduce((sum, addon) => sum + addon.preco, 0),
    [product.preco, chosenOptions, chosenAddons],
  );

  const toggleOption = (group: MenuOptionGroup, id: string) => {
    setSelected((current) => {
      const values = current[group.id] ?? [];
      if (values.includes(id)) return { ...current, [group.id]: values.filter((value) => value !== id) };
      if (values.length >= group.max_select) return current;
      return { ...current, [group.id]: [...values, id] };
    });
  };

  const confirm = () => {
    if (!valid) return;
    const item: CartItem = { id: crypto.randomUUID(), product, options: chosenOptions, addons: chosenAddons, observation, quantity, unitPrice };
    addItem(item);
    onClose();
  };

  const content = (
    <div className="grid gap-5">
      {product.imagem_url ? <img src={product.imagem_url} alt={product.nome} className="aspect-[4/3] w-full rounded-lg object-cover" /> : null}
      <div>
        <h2 className="text-2xl font-extrabold">{product.nome}</h2>
        {product.descricao ? <p className="mt-1 text-sm opacity-70">{product.descricao}</p> : null}
      </div>
      {groups.map((group) => {
        const multiple = group.max_select > 1 || group.min_select !== 1;
        return (
          <fieldset key={group.id} className="grid gap-2">
            <legend className="font-semibold">{group.nome} {group.obrigatorio ? <span className="text-[var(--color-danger)]">*</span> : null}</legend>
            {options.filter((option) => option.group_id === group.id).map((option) => {
              const checked = (selected[group.id] ?? []).includes(option.id);
              return (
                <label key={option.id} className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
                  <span>{option.nome}{option.preco_extra > 0 ? ` (+ R$ ${option.preco_extra.toFixed(2).replace(".", ",")})` : ""}</span>
                  {multiple ? <Checkbox checked={checked} onChange={() => toggleOption(group, option.id)} /> : <input type="radio" name={`group-${group.id}`} checked={checked} onChange={() => setSelected((current) => ({ ...current, [group.id]: [option.id] }))} className="accent-[var(--color-primary)]" />}
                </label>
              );
            })}
          </fieldset>
        );
      })}
      {availableAddonIds.length > 0 ? (
        <fieldset className="grid gap-2">
          <legend className="font-semibold">Adicionais</legend>
          {addons.filter((addon) => availableAddonIds.includes(addon.id)).map((addon) => (
            <label key={addon.id} className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
              <span>{addon.nome} (+ R$ {addon.preco.toFixed(2).replace(".", ",")})</span>
              <Checkbox checked={selectedAddons.includes(addon.id)} onChange={() => setSelectedAddons((values) => values.includes(addon.id) ? values.filter((value) => value !== addon.id) : [...values, addon.id])} />
            </label>
          ))}
        </fieldset>
      ) : null}
      <Textarea value={observation} onChange={(event) => setObservation(event.target.value)} placeholder="Observação do item" />
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</Button>
          <span className="min-w-6 text-center">{quantity}</span>
          <Button variant="outline" size="sm" onClick={() => setQuantity((value) => value + 1)}>+</Button>
        </div>
        <strong className="text-lg text-[var(--color-primary)]">R$ {(unitPrice * quantity).toFixed(2).replace(".", ",")}</strong>
      </div>
      <Button size="lg" disabled={!valid} onClick={confirm} className="w-full">Adicionar ao carrinho</Button>
    </div>
  );

  return (
    <>
      <div className="hidden md:block"><Dialog open={open} onClose={onClose} title="Personalizar pedido">{content}</Dialog></div>
      <div className="md:hidden"><BottomSheet open={open} onClose={onClose} title="Personalizar pedido">{content}</BottomSheet></div>
    </>
  );
}
