import type { CartAddon, CartItem, CartSelection, MenuAddon, MenuOption, MenuOptionGroup } from "@/types/cart";

export function getInitialSelections(groups: MenuOptionGroup[], item?: CartItem) {
  if (!item) return {} as Record<string, string[]>;
  return Object.fromEntries(
    groups.map((group) => [
      group.id,
      item.options.filter((option) => option.groupId === group.id).map((option) => option.optionId),
    ])
  ) as Record<string, string[]>;
}

export function buildSelectedOptions(selected: Record<string, string[]>, options: MenuOption[]): CartSelection[] {
  return Object.entries(selected).flatMap(([groupId, ids]) =>
    ids.flatMap((id) => {
      const option = options.find((item) => item.id === id && item.group_id === groupId && item.ativo);
      return option
        ? [{ optionId: option.id, groupId, nome: option.nome, precoExtra: option.preco_extra }]
        : [];
    })
  );
}

export function buildSelectedAddons(selectedIds: string[], addons: MenuAddon[]): CartAddon[] {
  return selectedIds.flatMap((id) => {
    const addon = addons.find((item) => item.id === id && item.ativo);
    return addon ? [{ addonId: addon.id, nome: addon.nome, preco: addon.preco }] : [];
  });
}

export function areSelectionsValid(groups: MenuOptionGroup[], selected: Record<string, string[]>) {
  return groups.every((group) => {
    const count = selected[group.id]?.length ?? 0;
    return count >= group.min_select && count <= group.max_select;
  });
}

export function toggleSelection(selected: Record<string, string[]>, group: MenuOptionGroup, id: string) {
  const current = selected[group.id] ?? [];
  if (current.includes(id)) {
    return { ...selected, [group.id]: current.filter((value) => value !== id) };
  }
  if (current.length >= group.max_select) return selected;
  return { ...selected, [group.id]: [...current, id] };
}
