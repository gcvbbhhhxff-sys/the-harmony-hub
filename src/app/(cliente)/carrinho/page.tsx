import { getPublicMenu } from "@/server/menu";
import CartPageClient from "@/components/cliente/cart-page-client";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const { optionGroups, options, addons, productAddons, settings } = await getPublicMenu();

  return (
    <CartPageClient
      optionGroups={optionGroups}
      options={options}
      addons={addons}
      productAddons={productAddons}
      minimumOrder={settings.valor_minimo_pedido}
    />
  );
}
