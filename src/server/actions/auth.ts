"use server";
import { createClient } from "@/lib/supabase/server";

export async function startAnonymousSession(){
  const supabase=await createClient();
  const {data,error}=await supabase.auth.signInAnonymously();
  if(error || !data.user)return{ok:false,message:"Não foi possível iniciar a sessão de visitante."};
  return{ok:true,message:"Sessão de visitante iniciada."};
}
