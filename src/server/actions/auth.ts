"use server";
import { createClient } from "@/lib/supabase/server";

export async function sendPhoneOtp(phone:string){
  const normalized=phone.replace(/\D/g,"");
  if(normalized.length<10)return {ok:false,message:"Informe um telefone válido."};
  const supabase=await createClient();
  const {error}=await supabase.auth.signInWithOtp({phone:`+55${normalized}`});
  if(error)return {ok:false,message:"Não foi possível enviar o código OTP."};
  return {ok:true,message:"Código enviado."};
}

export async function verifyPhoneOtp(phone:string,token:string){
  const normalized=phone.replace(/\D/g,"");
  if(normalized.length<10)return {ok:false,message:"Informe um telefone válido."};
  if(!token.trim())return {ok:false,message:"Informe o código OTP."};
  const supabase=await createClient();
  const {error}=await supabase.auth.verifyOtp({phone:`+55${normalized}`,token:token.trim(),type:"sms"});
  if(error)return {ok:false,message:"Código OTP inválido ou expirado."};
  return {ok:true};
}

export async function startAnonymousSession(){
  const supabase=await createClient();
  const {data,error}=await supabase.auth.signInAnonymously();
  if(error || !data.user)return {ok:false,message:"Não foi possível iniciar a sessão de visitante."};
  return {ok:true,message:"Você está como visitante."};
}
