import { createClient } from "@/lib/supabase/server";
import { CheckoutForm } from "@/components/cliente/checkout-form";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  let addresses: {
    id: string;
    rotulo: string | null;
    rua: string;
    numero: string;
    complemento: string | null;
    bairro: string;
    cidade: string;
    cep: string;
    referencia: string | null;
  }[] = [];

  if (user) {
    const { data: customer } = await supabase.from("customers").select("id").eq("user_id", user.id).maybeSingle();
    if (customer) {
      const { data } = await supabase
        .from("addresses")
        .select("id,rotulo,rua,numero,complemento,bairro,cidade,cep,referencia")
        .eq("customer_id", customer.id)
        .order("padrao", { ascending: false });
      addresses = data ?? [];
    }
  }

  const [{ data: settings }, { data: deliveryZones }] = await Promise.all([
    supabase.from("restaurant_settings").select("taxa_base_entrega,valor_minimo_pedido").limit(1).maybeSingle(),
    supabase.from("delivery_zones").select("id,nome,taxa").eq("ativo", true).order("nome"),
  ]);

  return (
    <CheckoutForm
      initialAddresses={addresses}
      authenticated={Boolean(user)}
      baseDeliveryFee={Number(settings?.taxa_base_entrega ?? 0)}
      minimumOrder={Number(settings?.valor_minimo_pedido ?? 0)}
      deliveryZones={(deliveryZones ?? []).map((zone) => ({ id: zone.id, nome: zone.nome, taxa: Number(zone.taxa) }))}
    />
  );
}
