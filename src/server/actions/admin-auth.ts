"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function adminLogin(email:string,password:string){
  const supabase=await createClient();
  const normalized=email.trim().toLowerCase();
  if(!normalized||!password)return {ok:false,message:"Informe e-mail e senha."};
  const {data,error}=await supabase.auth.signInWithPassword({email:normalized,password});
  if(error||!data.user)return {ok:false,message:"E-mail ou senha inválidos."};
  const {data:admin,error:adminError}=await supabase.from("admin_users").select("id,papel").eq("user_id",data.user.id).maybeSingle();
  if(adminError||!admin){
    await supabase.auth.signOut();
    return {ok:false,message:"Usuário sem acesso administrativo."};
  }
  if(admin.papel!=="admin"&&admin.papel!=="atendente"){
    await supabase.auth.signOut();
    return {ok:false,message:"Perfil administrativo inválido."};
  }
  redirect("/admin");
}
