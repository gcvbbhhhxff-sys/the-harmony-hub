"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function validateCoupon(codigo: string, valorPedido: number) {
  const code = codigo.trim();
  if (!code) return { valid: false, message: "Informe um cupom." };
  if (!Number.isFinite(valorPedido) || valorPedido < 0) {
    return { valid: false, message: "Valor do pedido inválido." };
  }

  const sessionClient = await createClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) return { valid: false, message: "Entre na sua conta para validar o cupom." };

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("validar_cupom", {
    codigo: code,
    valor_pedido: valorPedido,
  });

  if (error) return { valid: false, message: "Não foi possível validar o cupom." };

  const row = data?.[0];
  if (!row?.valido) return { valid: false, message: "Cupom inválido ou indisponível." };

  return {
    valid: true,
    tipo: row.tipo,
    valor: Number(row.valor),
    desconto: Number(row.desconto),
    message: "Cupom válido.",
  };
}
