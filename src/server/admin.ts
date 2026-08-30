import { createClient } from "@/lib/supabase/server";
export async function requireAdmin(){const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return null;const {data:admin}=await supabase.from("admin_users").select("id,nome,papel").eq("user_id",user.id).maybeSingle();return admin?{user,admin}:null;}
export async function assertRole(role:"admin"|"atendente"){const auth=await requireAdmin();if(!auth||auth.admin.papel!==role)return null;return auth;}
