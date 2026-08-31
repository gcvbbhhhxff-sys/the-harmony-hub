import { createClient } from "@/lib/supabase/server";
import SettingsAdminClient from "@/components/admin/settings-admin-client";

type OpeningHours=Record<string,{abertura:string;fechamento:string;ativo:boolean}>;
export const dynamic="force-dynamic";

const emptyHours: OpeningHours = { domingo:{abertura:"",fechamento:"",ativo:false},segunda:{abertura:"",fechamento:"",ativo:false},terca:{abertura:"",fechamento:"",ativo:false},quarta:{abertura:"",fechamento:"",ativo:false},quinta:{abertura:"",fechamento:"",ativo:false},sexta:{abertura:"",fechamento:"",ativo:false},sabado:{abertura:"",fechamento:"",ativo:false} };

export default async function SettingsPage(){
 const supabase=await createClient();
 const {data,error}=await supabase.from("restaurant_settings").select("id,nome,logo_url,background_url,descricao,telefone,endereco,status_manual,taxa_base_entrega,valor_minimo_pedido,chave_pix,whatsapp,tempo_estimado,horario_funcionamento").limit(1).maybeSingle();
 if(error) console.error("[SettingsPage]",error);
 const horarioFuncionamento=(data?.horario_funcionamento as OpeningHours|undefined)??emptyHours;
 return <SettingsAdminClient initial={{id:data?.id,nome:data?.nome??"Seu restaurante",logo_url:data?.logo_url??"",background_url:data?.background_url??"",descricao:data?.descricao??"",telefone:data?.telefone??"",endereco:data?.endereco??"",status_manual:(data?.status_manual==="aberto"||data?.status_manual==="fechado")?data.status_manual:"automatico",taxa_base_entrega:Number(data?.taxa_base_entrega??0),valor_minimo_pedido:Number(data?.valor_minimo_pedido??0),chave_pix:data?.chave_pix??"",whatsapp:data?.whatsapp??"",tempo_estimado:data?.tempo_estimado??"",horario_funcionamento:horarioFuncionamento}}/>;
}
