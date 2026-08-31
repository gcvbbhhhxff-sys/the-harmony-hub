"use client";
import { useEffect, useMemo, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateOrderStatus } from "@/server/actions/admin-orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Status = "recebido" | "preparando" | "pronto" | "saiu_para_entrega" | "entregue" | "cancelado";
type Order = { id: string; status: Status; status_pagamento: string; total: number; criado_em: string; customer: { nome: string; telefone: string } | null; items: { nome: string; quantidade: number; preco_unitario: number }[]; address: { rua: string; numero: string; bairro: string; cidade: string; cep: string } | null; observacoes: string | null };
const columns: Status[] = ["recebido", "preparando", "pronto", "saiu_para_entrega", "entregue", "cancelado"];
const labels: Record<Status, string> = { recebido: "Recebido", preparando: "Preparando", pronto: "Pronto", saiu_para_entrega: "Saiu para entrega", entregue: "Entregue", cancelado: "Cancelado" };
const nextStatus: Partial<Record<Status, Status>> = { recebido: "preparando", preparando: "pronto", pronto: "saiu_para_entrega", saiu_para_entrega: "entregue" };

export function OrdersBoard({ initial }: { initial: Order[] }) {
  const [orders, setOrders] = useState(initial);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "todos">("todos");
  const [selected, setSelected] = useState<Order | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("admin-orders").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
      setOrders((current) => {
        if (payload.eventType === "INSERT") return [payload.new as Order, ...current];
        if (payload.eventType === "DELETE") return current.filter((order) => order.id !== (payload.old as Order).id);
        return current.map((order) => order.id === (payload.new as Order).id ? { ...order, ...payload.new } : order);
      });
    }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(() => orders.filter((order) => {
    const term = query.toLocaleLowerCase("pt-BR");
    const text = `${order.id} ${order.customer?.nome ?? ""} ${order.customer?.telefone ?? ""}`.toLocaleLowerCase("pt-BR");
    return (!term || text.includes(term)) && (statusFilter === "todos" || order.status === statusFilter);
  }), [orders, query, statusFilter]);

  const move = (id: string, status: Status) => startTransition(async () => {
    const reason = status === "cancelado" ? window.prompt("Motivo do cancelamento") || "" : undefined;
    const result = await updateOrderStatus(id, status, reason);
    if (!result.ok) window.alert(result.message);
  });

  return <>
    <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_200px]"><Input placeholder="Buscar nome, telefone ou pedido" value={query} onChange={(event) => setQuery(event.target.value)} /><select className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as Status | "todos")}><option value="todos">Todos os status</option>{columns.map((status) => <option key={status} value={status}>{labels[status]}</option>)}</select></div>
    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6 xl:min-w-[1320px]">
      {columns.map((status) => <section key={status}><div className="mb-3 flex items-center justify-between"><h2 className="font-bold">{labels[status]}</h2><span className="text-xs text-[var(--color-muted)]">{filtered.filter((order) => order.status === status).length}</span></div><div className="grid gap-3">{filtered.filter((order) => order.status === status).map((order) => <Card key={order.id} className="border-black/5"><button type="button" className="w-full text-left" onClick={() => setSelected(order)}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-bold">#{order.id.slice(0, 8)}</p><p className="truncate text-sm">{order.customer?.nome || "Cliente"}</p></div><Badge status={status === "saiu_para_entrega" ? "saiu" : status}>{labels[status]}</Badge></div><p className="mt-3 text-xs text-[var(--color-muted)]">{new Date(order.criado_em).toLocaleString("pt-BR")}</p><div className="mt-2 font-bold">R$ {Number(order.total).toFixed(2).replace(".", ",")}</div></button>{nextStatus[status] && <Button className="mt-3 h-10 w-full rounded-xl" size="sm" disabled={pending} onClick={() => move(order.id, nextStatus[status] as Status)}>Avançar para {labels[nextStatus[status] as Status]}</Button>}{status !== "entregue" && status !== "cancelado" && <Button variant="outline" className="mt-2 h-10 w-full rounded-xl" size="sm" disabled={pending} onClick={() => move(order.id, "cancelado")}>Cancelar pedido</Button>}</Card>)}</div></section>)}
    </div>
    <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} title={selected ? `Pedido #${selected.id.slice(0, 8)}` : "Pedido"}>{selected ? <div className="grid gap-4 text-sm"><p><strong>Cliente:</strong> {selected.customer?.nome || "—"}</p>{selected.customer?.telefone && <p><strong>Telefone:</strong> <a className="underline" href={`https://wa.me/${selected.customer.telefone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp</a></p>}<div><strong>Itens</strong><div className="mt-2 grid gap-1">{selected.items.map((item, index) => <p key={`${item.nome}-${index}`}>{item.quantidade}× {item.nome} — R$ {Number(item.preco_unitario).toFixed(2).replace(".", ",")}</p>)}</div></div>{selected.address && <p><strong>Endereço:</strong> {selected.address.rua}, {selected.address.numero} — {selected.address.bairro}, {selected.address.cidade} — {selected.address.cep}</p>}{selected.observacoes && <p><strong>Observações:</strong> {selected.observacoes}</p>}<Button className="h-11 rounded-xl" onClick={() => setSelected(null)}>Fechar</Button></div> : null}</Dialog>
  </>;
}
