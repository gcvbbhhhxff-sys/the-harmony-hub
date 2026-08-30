import { createClient } from "@/lib/supabase/server";
import { CheckoutForm } from "@/components/cliente/checkout-form";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (customer) {
      const { data } = await supabase
        .from("addresses")
        .select("id,rotulo,rua,numero,complemento,bairro,cidade,cep,referencia")
        .eq("customer_id", customer.id)
        .order("padrao", { ascending: false });
      addresses = data ?? [];
    }
  }

  return (
    <CheckoutForm
      initialAddresses={addresses}
      authenticated={Boolean(user)}
      initialPhone={user?.phone ?? ""}
    />
  );
}
