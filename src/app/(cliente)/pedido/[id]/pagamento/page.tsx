import { createClient } from "@/lib/supabase/server";
import { notFound,redirect } from "next/navigation";
import { PaymentView } from "@/components/cliente/payment-view";
export const dynamic="force-dynamic";
export default async function PaymentPage({params}:{params:{id:string}}){const supabase=await createClient();const {data:order}=await supabase.from("orders").select("id,forma_pagamento,status_pagamento").eq("id",params.id).maybeSingle();if(!order)notFound();if(order.status_pagamento==="confirmado")redirect(`/pedido/${params.id}`);if(order.forma_pagamento==="na_entrega")redirect(`/pedido/${params.id}`);return <PaymentView orderId={order.id} method={order.forma_pagamento as "pix"|"cartao"}/>}
