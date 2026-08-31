import { createClient } from "@/lib/supabase/server";
import MenuAdminClientGallery from "@/components/admin/menu-admin-client-gallery";

export const dynamic="force-dynamic";

export default async function MenuAdminPage(){
 const supabase=await createClient();
 const [{data:categories},{data:products},{data:groups},{data:options},{data:addons},{data:links}]=await Promise.all([
  supabase.from("categories").select("id,nome,ordem,ativo").order("ordem"),
  supabase.from("products").select("id,category_id,nome,descricao,preco,imagem_url,ativo,destaque").order("nome"),
  supabase.from("option_groups").select("id,product_id,nome,min_select,max_select,obrigatorio,ordem").order("ordem"),
  supabase.from("options").select("id,group_id,nome,preco_extra,ordem,ativo").order("ordem"),
  supabase.from("addons").select("id,nome,preco,ativo").order("nome"),
  supabase.from("product_addons").select("product_id,addon_id"),
 ]);
 return <MenuAdminClientGallery initial={{categories:categories??[],products:products??[],groups:groups??[],options:options??[],addons:addons??[],links:links??[]}}/>;
}
