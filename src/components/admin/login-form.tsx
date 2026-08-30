"use client";
import { useState,useTransition } from "react";
import { adminLogin } from "@/server/actions/admin-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function LoginForm(){
  const [email,setEmail]=useState("admin@admin");
  const [password,setPassword]=useState("admin");
  const [message,setMessage]=useState("");
  const [pending,startTransition]=useTransition();
  const submit=()=>startTransition(async()=>{setMessage("");const r=await adminLogin(email,password);if(!r?.ok)setMessage(r.message||"Não foi possível entrar.")});
  return <main className="min-h-screen grid place-items-center bg-[radial-gradient(circle_at_top,rgba(211,163,40,.18),transparent_34rem)] bg-[var(--color-secondary)] p-4">
    <Card className="w-full max-w-md rounded-3xl p-7 shadow-[0_24px_70px_rgba(0,0,0,.3)]">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">Área administrativa</p>
      <h1 className="mt-2 text-3xl font-black">Entrar na gerência</h1>
      <p className="mt-2 text-sm text-black/55">Acesso restrito ao painel do estabelecimento.</p>
      <div className="mt-6 grid gap-3">
        <Input type="email" autoComplete="username" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")submit()}}/>
        <Input type="password" autoComplete="current-password" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")submit()}}/>
        <Button className="h-12 rounded-xl font-black" disabled={pending} onClick={submit}>{pending?"Entrando…":"Entrar"}</Button>
        {message&&<p className="text-sm font-medium text-[var(--color-danger)]" role="alert">{message}</p>}
      </div>
    </Card>
  </main>;
}
