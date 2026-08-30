"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export async function adminLogin(email:string,password:string){const supabase=await createClient();const {data,error}=await supabase.auth.signInWithPassword({email,password});if(error)return {ok:false,message:"E-mail ou senha inválidos."};const {data:admin}=await supabase.from("admin_users").select("id,papel").eq("user_id",data.user.id).maybeSingle();if(!admin){await supabase.auth.signOut();return {ok:false,message:"Usuário sem acesso administrativo."};}return redirect("/admin");}
