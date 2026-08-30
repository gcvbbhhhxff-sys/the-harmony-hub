import Link from "next/link";
import { requireAdmin } from "@/server/admin";
import { Logo } from "@/components/ui/logo";
import { LayoutDashboard, ClipboardList, UtensilsCrossed, TicketPercent, MapPinned, Settings } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireAdmin();
  if (!auth) return children;
  const admin = auth.admin;

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, always: true },
    { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList, always: true },
    { href: "/admin/cardapio", label: "Cardápio", icon: UtensilsCrossed, always: false },
    { href: "/admin/cupons", label: "Cupons", icon: TicketPercent, always: false },
    { href: "/admin/zonas-de-entrega", label: "Entrega", icon: MapPinned, always: false },
    { href: "/admin/configuracoes", label: "Configurações", icon: Settings, always: false },
  ];

  return (
    <div className="min-h-screen bg-[#f7f5f1] md:flex">
      <aside className="border-b border-white/10 bg-[#0d1013] text-white md:sticky md:top-0 md:h-screen md:w-[260px] md:shrink-0 md:border-b-0">
        <div className="flex items-center gap-3 px-5 py-5">
          <Logo size={50} className="shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.23em] text-[#f4bf32]">Painel</p>
            <p className="truncate text-base font-black">Tabajara&apos;s</p>
          </div>
        </div>
        <div className="px-4 pb-4"><div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><p className="truncate text-sm font-bold">{admin.nome}</p><p className="mt-0.5 text-xs capitalize text-white/50">{admin.papel}</p></div></div>
        <nav className="grid gap-1 px-3 pb-5" aria-label="Navegação da gerência">
          {links.filter((item) => item.always || admin.papel === "admin").map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="group flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-bold text-white/70 transition hover:bg-white/8 hover:text-white">
              <Icon className="h-4 w-4 text-[#f4bf32] transition group-hover:scale-105" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-black/5 bg-white/90 px-4 backdrop-blur-xl sm:px-6">
          <div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#aa7f18]">Gestão</p><p className="text-sm font-black">Operação do restaurante</p></div>
          <Link href="/" target="_blank" className="rounded-xl border border-black/10 px-3 py-2 text-xs font-bold hover:bg-black/[.03]">Ver site</Link>
        </header>
        {children}
      </section>
    </div>
  );
}
