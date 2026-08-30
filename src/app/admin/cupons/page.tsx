import { createClient } from "@/lib/supabase/server";
import CouponAdminClient from "@/components/admin/coupon-admin-client";
export const dynamic="force-dynamic";
export default async function CouponsPage(){const supabase=await createClient();const {data}=await supabase.from("coupons").select("id,codigo,tipo,valor,pedido_minimo,limite_usos,usos_atuais,validade,ativo").order("criado_em",{ascending:false});return <CouponAdminClient initial={data??[]}/>}
