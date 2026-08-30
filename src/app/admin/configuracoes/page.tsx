import { createClient } from "@/lib/supabase/server";
import SettingsAdminClient from "@/components/admin/settings-admin-client";

type OpeningHours=Record<string,{abertura:string;fechamento:string;ativo:boolean}>;
export const dynamic="force-dynamic";

export default async function SettingsPage(){
 const supabase=await createClient();
 const {data}=await supabase.from("restaurant_settings").select("nome,logo_url,background_url,taxa_base_entrega,valor_minimo_pedido,chave_pix,whatsapp,tempo_estimado,horario_funcionamento").limit(1).maybeSingle();
 const horarioFuncionamento:OpeningHours=(data?.horario_funcionamento as OpeningHours|null|undefined)??{};
 return <SettingsAdminClient initial={{nome:data?.nome??"Tabajara's Churrascaria",logo_url:data?.logo_url??"",background_url:data?.background_url??"",taxa_base_entrega:Number(data?.taxa_base_entrega??0),valor_minimo_pedido:Number(data?.valor_minimo_pedido??0),chave_pix:data?.chave_pix??"",whatsapp:data?.whatsapp??"",tempo_estimado:data?.tempo_estimado??"40-60 minutos",horario_funcionamento:horarioFuncionamento}}/>;
}
