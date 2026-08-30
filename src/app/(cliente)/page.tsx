import { getPublicMenu } from "@/server/menu";
import { MenuBrowser } from "@/components/cliente/menu-browser";
import { RestaurantBrandProvider } from "@/components/cliente/restaurant-brand-provider";

export const dynamic = "force-dynamic";

export default async function ClientHomePage() {
  const data = await getPublicMenu();
  return (
    <RestaurantBrandProvider nome={data.settings.nome} logoUrl={data.settings.logo_url}>
      <div className="min-h-screen"><MenuBrowser {...data}/></div>
    </RestaurantBrandProvider>
  );
}
