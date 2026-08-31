import type { CartAddon, CartSelection } from "@/types/cart";

export function calculateItemUnitPrice(basePrice: number, options: CartSelection[] = [], addons: CartAddon[] = []) {
  return basePrice + options.reduce((total, option) => total + option.precoExtra, 0) + addons.reduce((total, addon) => total + addon.preco, 0);
}

export function calculateItemTotal(basePrice: number, quantity: number, options: CartSelection[] = [], addons: CartAddon[] = []) {
  return calculateItemUnitPrice(basePrice, options, addons) * Math.max(1, quantity);
}
