import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ClipboardList, DollarSign, ShoppingBag, Timer } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";

type DashboardStat = {
  label: string;
  value: string | number;
  hint: string;
  Icon: LucideIcon;
};

export default async function AdminDashboard() {
  const supabase = await createClient();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const { data: orders } = await supabase
    .from("orders")
    .select("id,total,status,status_pagamento,criado_em")
    .gte("criado_em", start.toISOString())
    .order("criado_em", { ascending: false });

  const rows = orders ?? [];
  const operational = rows.filter((order) => order.status_pagamento === "confirmado");
  const revenue = operational.reduce((sum, order) => sum + Number(order.total), 0);
  const avg = operational.length ? revenue / operational.length : 0;
  const pending = rows.filter((order) => order.status_pagamento === "pendente").length;
  const activeOrders = rows.filter(
    (order) =>
      ["recebido", "preparando", "pronto", "saiu_para_entrega"].includes(order.status) &&
      order.status_pagamento === "confirmado"
  ).length;

  const stats: DashboardStat[] = [
    { label: "Pedidos hoje", value: operational.length, hint: `${activeOrders} em andamento`, Icon: ShoppingBag },
    { label: "Faturamento", value: `R$ ${revenue.toFixed(2).replace(".", ",")}`, hint: "Pedidos confirmados", Icon: DollarSign },
    { label: "Aguardando", value: pending, hint: "Pagamento pendente", Icon: Timer },
    { label: "Ticket médio", value: `R$ ${avg.toFixed(2).replace(".", ",")}`, hint: "Média dos pedidos", Icon: ClipboardList },
  ];

  return (
    <main className="p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-[#0d1013] p-6 text-white shadow-[0_20px_55px_rgba(13,16,19,.16)] sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f4bf32]">Centro de operação</p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Bem-vindo de volta</h1>
              <p className="mt-1 text-sm text-white/55">Você tem {operational.length} pedido{operational.length !== 1 ? "s" : ""} hoje</p>
            </div>
            <a href="/admin/pedidos" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#f4bf32] px-4 text-sm font-black text-black hover:bg-[#e3ae22]">
              Abrir pedidos
            </a>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, hint, Icon }) => (
            <Card key={label} className="rounded-2xl border-black/5 p-5 shadow-[0_12px_32px_rgba(17,17,17,.05)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-black/35">{label}</p>
                  <p className="mt-2 text-2xl font-black leading-tight">{value}</p>
                  <p className="mt-1 text-xs text-black/55">{hint}</p>
                </div>
                <Icon className="mt-0.5 h-5 w-5 text-[#aa7f18]" />
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-6 rounded-3xl border-black/5 p-5 shadow-[0_14px_40px_rgba(17,17,17,.05)] sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#aa7f18]">Atividade recente</p>
              <h2 className="mt-1 text-xl font-black">Últimos pedidos</h2>
            </div>
            <a href="/admin/pedidos" className="text-sm font-black text-[#aa7f18] hover:underline">Ver tudo →</a>
          </div>
          <div className="mt-5 overflow-hidden rounded-2xl border border-black/5">
            {rows.length === 0 ? (
              <div className="p-10 text-center">
                <ShoppingBag className="mx-auto h-8 w-8 text-[#aa7f18]" />
                <p className="mt-3 font-black">Nenhum pedido hoje</p>
                <p className="mt-1 text-sm text-black/55">Você verá os pedidos aqui conforme eles chegarem</p>
              </div>
            ) : (
              <table className="w-full">
                <thead><tr className="border-b border-black/5 bg-black/2"><th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-black/55">ID</th><th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-black/55">Status</th><th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-black/55">Total</th><th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-black/55">Horário</th></tr></thead>
                <tbody>{rows.slice(0, 5).map((order) => <tr key={order.id} className="border-b border-black/5 hover:bg-black/2"><td className="px-4 py-3 text-sm font-mono text-black/75">{order.id.slice(0, 8)}</td><td className="px-4 py-3"><Badge status={order.status === "saiu_para_entrega" ? "saiu" : order.status}>{order.status}</Badge></td><td className="px-4 py-3 font-black">R$ {Number(order.total).toFixed(2).replace(".", ",")}</td><td className="px-4 py-3 text-sm text-black/55">{new Date(order.criado_em).toLocaleTimeString("pt-BR")}</td></tr>)}</tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
