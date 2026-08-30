import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowRight, ClipboardList, DollarSign, ShoppingBag, Timer } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const { data: orders } = await supabase.from("orders").select("id,total,status,status_pagamento,criado_em").gte("criado_em", start.toISOString()).order("criado_em", { ascending: false });
  const rows = orders ?? [];
  const operational = rows.filter((order) => order.status_pagamento === "confirmado");
  const revenue = operational.reduce((sum, order) => sum + Number(order.total), 0);
  const avg = operational.length ? revenue / operational.length : 0;
  const pending = rows.filter((order) => order.status_pagamento === "pendente").length;
  const activeOrders = rows.filter((order) => ["recebido", "preparando", "saiu_para_entrega"].includes(order.status) && order.status_pagamento === "confirmado")).length;

  const cards = [
    { label: "Pedidos hoje", value: operational.length, hint: `${activeOrders} em andamento`, icon: ShoppingBag },
    { label: "Faturamento", value: `R$ ${revenue.toFixed(2).replace(".", ",")}`, hint: "Pedidos confirmados", icon: DollarSign },
    { label: "Aguardando", value: pending, hint: "Pagamento pendente", icon: Timer },
    { label: "Ticket médio", value: `R$ ${avg.toFixed(2).replace(".", ",")}`, hint: "Média dos pedidos", icon: ClipboardList },
  ];

  return (
    <main className="p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-[#0d1013] p-6 text-white shadow-[0_20px_55px_rgba(13,16,19,.16)] sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div><p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f4bf32]">Centro de operação</p><h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Bom trabalho. Vamos acompanhar a operação.</h1><p className="mt-2 text-sm text-white/60">Pedidos, faturamento e atividade do restaurante em um só lugar.</p></div>
            <Link href="/admin/pedidos" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#f4bf32] px-4 text-sm font-black text-black hover:bg-[#e3ae22]">Abrir pedidos <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, hint, icon: Icon }) => <Card key={label} className="rounded-2xl border-black/5 p-5 shadow-[0_12px_32px_rgba(17,17,17,.05)]"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold text-[#6f6a62]">{label}</p><p className="mt-2 text-2xl font-black tracking-[-0.03em]">{value}</p><p className="mt-1 text-xs text-[#8a857c]">{hint}</p></div><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff4cf]"><Icon className="h-5 w-5 text-[#aa7f18]" /></span></div></Card>)}
        </div>

        <Card className="mt-6 rounded-3xl border-black/5 p-5 shadow-[0_14px_40px_rgba(17,17,17,.05)] sm:p-6">
          <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#aa7f18]">Atividade recente</p><h2 className="mt-1 text-xl font-black">Pedidos de hoje</h2></div><Link href="/admin/pedidos" className="hidden items-center gap-1 text-sm font-bold text-[#5a554d] sm:flex">Ver todos <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="mt-5 overflow-hidden rounded-2xl border border-black/5">
            {rows.length === 0 ? <div className="p-10 text-center"><ShoppingBag className="mx-auto h-8 w-8 text-[#aa7f18]" /><p className="mt-3 font-black">Nenhum pedido hoje</p><p className="mt-1 text-sm text-[#6f6a62]">Quando chegar um pedido, ele aparecerá aqui.</p></div> : <div className="divide-y divide-black/5">{rows.slice(0, 10).map((order) => <Link key={order.id} href="/admin/pedidos" className="flex flex-wrap items-center gap-3 px-4 py-4 transition hover:bg-black/[.015]"><span className="w-24 text-sm font-black">#{order.id.slice(0, 8)}</span><Badge status={order.status === "saiu_para_entrega" ? "saiu" : order.status as "recebido"}>{order.status.replaceAll("_", " ")}</Badge><span className="ml-auto text-sm font-black">R$ {Number(order.total).toFixed(2).replace(".", ",")}</span><span className="text-xs text-[#8a857c]">{new Date(order.criado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span></Link>)}</div>}
          </div>
        </Card>
      </div>
    </main>
  );
}
