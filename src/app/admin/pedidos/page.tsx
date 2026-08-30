import { createClient } from "@/lib/supabase/server";
import { OrdersBoard } from "@/components/admin/orders-board";

export const dynamic = "force-dynamic";

type OneOrMany<T> = T | T[] | null;

type OrderRow = {
  id: string;
  status: "recebido" | "preparando" | "saiu_para_entrega" | "entregue" | "cancelado";
  status_pagamento: "pendente" | "confirmado" | "falhou";
  total: number;
  criado_em: string;
  observacoes: string | null;
  customers: OneOrMany<{ nome: string; telefone: string }>;
  addresses: OneOrMany<{ rua: string; numero: string; bairro: string; cidade: string; cep: string }>;
  order_items: {
    quantidade: number;
    preco_unitario: number;
    products: OneOrMany<{ nome: string }>;
  }[];
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "id,status,status_pagamento,total,criado_em,observacoes,customers(nome,telefone),addresses(rua,numero,bairro,cidade,cep),order_items(quantidade,preco_unitario,products(nome))",
    )
    .order("criado_em", { ascending: false });

  const rows = (data ?? []) as unknown as OrderRow[];
  const initial = rows.map((o) => {
    const customer = Array.isArray(o.customers) ? o.customers[0] ?? null : o.customers ?? null;
    const address = Array.isArray(o.addresses) ? o.addresses[0] ?? null : o.addresses ?? null;

    return {
      id: o.id,
      status: o.status,
      status_pagamento: o.status_pagamento,
      total: Number(o.total),
      criado_em: o.criado_em,
      observacoes: o.observacoes,
      customer,
      address,
      items: (o.order_items ?? []).map((item) => {
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
