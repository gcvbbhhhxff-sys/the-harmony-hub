import { createClient } from "@/lib/supabase/server";
import { OrdersBoard } from "@/components/admin/orders-board";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "id,status,status_pagamento,total,criado_em,observacoes,customers(nome,telefone),addresses(rua,numero,bairro,cidade,cep),order_items(quantidade,preco_unitario,products(nome))",
    )
    .order("criado_em", { ascending: false });

  const rows = (data ?? []) as any[];
  const initial = rows.map((o) => {
    const customer = Array.isArray(o.customers) ? o.customers[0] ?? null : o.customers ?? null;
    const address = Array.isArray(o.addresses) ? o.addresses[0] ?? null : o.addresses ?? null;

    return {
      id: o.id as string,
      status: o.status as "recebido" | "preparando" | "saiu_para_entrega" | "entregue" | "cancelado",
      status_pagamento: o.status_pagamento as "pendente" | "confirmado" | "falhou",
      total: Number(o.total),
      criado_em: o.criado_em as string,
      observacoes: (o.observacoes as string | null) ?? null,
      customer: customer as { nome: string; telefone: string } | null,
      address: address as {
        rua: string;
        numero: string;
        bairro: string;
        cidade: string;
        cep: string;
      } | null,
      items: ((o.order_items ?? []) as any[]).map((item) => {
        const product = Array.isArray(item.products) ? item.products[0] : item.products;
        return {
          nome: product?.nome ?? "Produto",
          quantidade: Number(item.quantidade),
          preco_unitario: Number(item.preco_unitario),
        };
      }),
    };
  });

  return (
    <main className="overflow-x-auto p-4 md:p-6">
      <h1 className="text-3xl font-extrabold">Pedidos</h1>
      <OrdersBoard initial={initial} />
    </main>
  );
}
