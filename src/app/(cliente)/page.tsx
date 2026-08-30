import { getPublicMenu } from "@/server/menu";
import { MenuBrowser } from "@/components/cliente/menu-browser";
export const dynamic="force-dynamic";
export default async function ClientHomePage(){const data=await getPublicMenu();return <div className="min-h-screen"><MenuBrowser {...data}/></div>}
