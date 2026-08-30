import { createClient } from "@/lib/supabase/server";
import ZoneAdminClient from "@/components/admin/zone-admin-client";
export const dynamic="force-dynamic";
export default async function DeliveryZonesPage(){const supabase=await createClient();const {data}=await supabase.from("delivery_zones").select("id,nome,taxa,ativo").order("nome");return <ZoneAdminClient initial={data??[]}/>}
