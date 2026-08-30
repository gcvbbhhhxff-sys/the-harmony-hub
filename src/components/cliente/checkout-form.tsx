"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { validateCoupon } from "@/server/actions/coupon";
import { sendPhoneOtp, verifyPhoneOtp } from "@/server/actions/auth";
import { createOrder } from "@/server/actions/order";
import { useCartStore, cartTotal } from "@/lib/cart/store";

type SavedAddress = { id:string; rotulo:string|null; rua:string; numero:string; complemento:string|null; bairro:string; cidade:string; cep:string; referencia:string|null };
type CheckoutProps = { initialAddresses:SavedAddress[]; authenticated:boolean; initialPhone:string };

export function CheckoutForm({initialAddresses,authenticated,initialPhone}:CheckoutProps) {
  const router=useRouter();
  const items=useCartStore(s=>s.items); const clear=useCartStore(s=>s.clear);
  const [consent,setConsent]=useState(false); const [phone,setPhone]=useState(initialPhone); const [otp,setOtp]=useState(""); const [identified,setIdentified]=useState(authenticated);
  const [customer,setCustomer]=useState({nome:"",email:""}); const [saved]=useState(initialAddresses); const [selectedAddress,setSelectedAddress]=useState(initialAddresses[0]?.id??"");
  const [form,setForm]=useState({rua:"",numero:"",complemento:"",bairro:"",cidade:"",cep:"",referencia:"",observacoes:""});
  const [payment,setPayment]=useState<"pix"|"cartao"|"na_entrega">("pix"); const [coupon,setCoupon]=useState(""); const [discount,setDiscount]=useState(0); const [message,setMessage]=useState("");
  const [pending,startTransition]=useTransition(); const total=cartTotal(items);
  useEffect(()=>{if(!items.length)router.replace("/carrinho")},[items.length,router]);
  const useSaved=saved.find(a=>a.id===selectedAddress);
  const submit=()=>startTransition(async()=>{
    if(!identified){setMessage("Confirme seu telefone por OTP antes de continuar.");return}
    if(!customer.nome.trim()||!customer.email.includes("@")){setMessage("Informe nome e e-mail válidos.");return}
    if(!consent){setMessage("O consentimento com a política de privacidade é obrigatório.");return}
    const result=await createOrder({customer,items:items.map(i=>({productId:i.product.id,quantity:i.quantity,optionIds:i.options.map(o=>o.optionId),addonIds:i.addons.map(a=>a.addonId),observation:i.observation})),addressId:useSaved?.id,address:useSaved?undefined:form,formaPagamento:payment,observacoes:form.observacoes,couponCode:coupon||undefined});
    if(!result.ok){setMessage(result.message??"Não foi possível criar o pedido.");return}
    clear(); router.push(payment==="na_entrega"?`/pedido/${result.orderId}`:`/pedido/${result.orderId}/pagamento`);
  });
  const applyCoupon=()=>startTransition(async()=>{const result=await validateCoupon(coupon,total);setDiscount(result.valid?result.desconto||0:0);setMessage(result.message||"")});
  return <main className="mx-auto max-w-3xl px-4 py-6 md:px-6"><h1 className="text-3xl font-extrabold">Finalizar pedido</h1><div className="mt-6 grid gap-5">{!authenticated&&<Card><h2 className="font-bold">Identificação</h2><div className="mt-3 grid gap-3"><Input placeholder="Seu nome" value={customer.nome} onChange={e=>setCustomer({...customer,nome:e.target.value})}/><Input type="email" placeholder="Seu e-mail" value={customer.email} onChange={e=>setCustomer({...customer,email:e.target.value})}/><Input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="(00) 00000-0000"/><Button size="sm" onClick={()=>startTransition(async()=>{const r=await sendPhoneOtp(phone);setMessage(r.message??"Não foi possível enviar o código.")})} disabled={pending||identified}>Enviar código</Button><Input value={otp} onChange={e=>setOtp(e.target.value)} placeholder="Código OTP"/><Button variant="outline" size="sm" onClick={()=>startTransition(async()=>{const r=await verifyPhoneOtp(phone,otp);setIdentified(r.ok);setMessage(r.ok?"Telefone confirmado.":r.message??"Código inválido.")})} disabled={pending||identified}>Confirmar código</Button></div></Card>}{authenticated&&<Card><h2 className="font-bold">Seus dados</h2><div className="mt-3 grid gap-3"><Input placeholder="Seu nome" value={customer.nome} onChange={e=>setCustomer({...customer,nome:e.target.value})}/><Input type="email" placeholder="Seu e-mail" value={customer.email} onChange={e=>setCustomer({...customer,email:e.target.value})}/></div></Card>}<Card><h2 className="font-bold">Endereço</h2>{saved.length>0&&<div className="mt-3 grid gap-2"><p className="text-sm opacity-70">Escolha um endereço salvo ou cadastre um novo.</p>{saved.map(a=><label key={a.id} className="flex gap-2 rounded-md border p-3 text-sm"><input type="radio" checked={selectedAddress===a.id} onChange={()=>setSelectedAddress(a.id)}/><span>{a.rotulo||"Endereço"}: {a.rua}, {a.numero} — {a.bairro}</span></label>)}<label className="flex gap-2 text-sm"><input type="radio" checked={!useSaved} onChange={()=>setSelectedAddress("")}/> Novo endereço</label></div>}{!useSaved&&<div className="mt-3 grid gap-3 sm:grid-cols-2"><Input placeholder="Rua" value={form.rua} onChange={e=>setForm({...form,rua:e.target.value})}/><Input placeholder="Número" value={form.numero} onChange={e=>setForm({...form,numero:e.target.value})}/><Input placeholder="Complemento" value={form.complemento} onChange={e=>setForm({...form,complemento:e.target.value})}/><Input placeholder="Bairro" value={form.bairro} onChange={e=>setForm({...form,bairro:e.target.value})}/><Input placeholder="Cidade" value={form.cidade} onChange={e=>setForm({...form,cidade:e.target.value})}/><Input placeholder="CEP" value={form.cep} onChange={e=>setForm({...form,cep:e.target.value})}/><Input className="sm:col-span-2" placeholder="Ponto de referência" value={form.referencia} onChange={e=>setForm({...form,referencia:e.target.value})}/></div>}</Card><Card><h2 className="font-bold">Cupom</h2><div className="mt-3 flex gap-2"><Input value={coupon} onChange={e=>setCoupon(e.target.value.toUpperCase())} placeholder="Código"/><Button variant="outline" onClick={applyCoupon} disabled={pending}>Aplicar</Button></div></Card><Card><h2 className="font-bold">Pagamento</h2><div className="mt-3 grid gap-2"><label><input type="radio" checked={payment==="pix"} onChange={()=>setPayment("pix")}/> Pix</label><label><input type="radio" checked={payment==="cartao"} onChange={()=>setPayment("cartao")}/> Cartão</label><label><input type="radio" checked={payment==="na_entrega"} onChange={()=>setPayment("na_entrega")}/> Na entrega</label></div></Card><Card><Textarea placeholder="Observações do pedido" value={form.observacoes} onChange={e=>setForm({...form,observacoes:e.target.value})}/><label className="mt-4 flex items-start gap-2 text-sm"><Checkbox checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>Concordo com a <a className="underline" href="/politica-de-privacidade">política de privacidade</a>.</span></label><div className="mt-5 flex items-center justify-between font-bold"><span>Total</span><span>R$ {Math.max(0,total-discount).toFixed(2).replace(".",",")}</span></div><Button size="lg" className="mt-4 w-full" onClick={submit} disabled={pending||!items.length}>{pending?"Processando…":"Confirmar pedido"}</Button>{message&&<p className="mt-3 text-sm">{message}</p>}</Card></div></main>
}
