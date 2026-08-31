import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrderTracker } from "@/components/cliente/order-tracker";

export const dynamic = "force-dynamic";

type OrderItemRow = {
  quantidade: number;
  preco_unitario: number;
  opcoes_selecionadas: unknown;
  adicionais_selecionados: unknown;
  observacao_item: string | null;
  products: { nome: string } | { nome: string }[] | null;
};

type HistoryRow = {
  status: "recebido" | "preparando" | "saiu_para_entrega" | "entregue" | "cancelado";
  alterado_em: string;
  motivo_cancelamento: string | null;
};

type OrderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      "id,status,subtotal,taxa_entrega,desconto,total,forma_pagamento,status_pagamento,observacoes,criado_em,address:addresses(rua,numero,complemento,bairro,cidade,cep,referencia),items:order_items(quantidade,preco_unitario,opcoes_selecionadas,adicionais_selecionados,observacao_item,products(nome))",
    )
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  const { data: history } = await supabase
    .from("order_status_history")
    .select("status,alterado_em,motivo_cancelamento")
    .eq("order_id", id)
    .order("alterado_em");
  const { data: settings } = await supabase
    .from("restaurant_settings")
    .select("whatsapp,tempo_estimado")
    .limit(1)
    .maybeSingle();

  const address = Array.isArray(order.address) ? order.address[0] ?? null : order.address;
  const items = ((order.items ?? []) as unknown as OrderItemRow[]).map((item) => ({
    nome: Array.isArray(item.products) ? item.products[0]?.nome ?? "Produto" : item.products?.nome ?? "Produto",
    quantidade: Number(item.quantidade),
    preco_unitario: Number(item.preco_unitario),
    opcoes_selecionadas: item.opcoes_selecionadas,
    adicionais_selecionados: item.adicionais_selecionados,
    observacao_item: item.observacao_item,
  }));

  return (
    <OrderTracker
      order={{
        ...order,
        address,
        items,
        subtotal: Number(order.subtotal),
        taxa_entrega: Number(order.taxa_entrega),
        desconto: Number(order.desconto),
        total: Number(order.total),
      }}
      history={(history ?? []) as HistoryRow[]}
      whatsapp={settings?.whatsapp ?? null}
      tempoEstimado={settings?.tempo_estimado ?? null}
    />
  );
}
