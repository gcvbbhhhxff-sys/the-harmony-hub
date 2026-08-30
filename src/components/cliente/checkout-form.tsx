"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { validateCoupon } from "@/server/actions/coupon";
import { startAnonymousSession } from "@/server/actions/auth";
import { createOrder } from "@/server/actions/order";
import { cartTotal, useCartStore } from "@/lib/cart/store";

type SavedAddress = { id: string; rotulo: string | null; rua: string; numero: string; complemento: string | null; bairro: string; cidade: string; cep: string; referencia: string | null };
type CheckoutProps = { initialAddresses: SavedAddress[]; authenticated: boolean; initialPhone: string };

export function CheckoutForm({ initialAddresses, authenticated }: CheckoutProps) {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const hydrated = useCartStore((state) => state.hydrated);
  const clear = useCartStore((state) => state.clear);
  const [consent, setConsent] = useState(false);
  const [identified, setIdentified] = useState(authenticated);
  const [customer, setCustomer] = useState({ nome: "", email: "" });
  const [saved] = useState(initialAddresses);
  const [selectedAddress, setSelectedAddress] = useState(initialAddresses[0]?.id ?? "");
  const [form, setForm] = useState({ rua: "", numero: "", complemento: "", bairro: "", cidade: "", cep: "", referencia: "", observacoes: "" });
  const [payment, setPayment] = useState<"pix" | "cartao" | "na_entrega">("pix");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const total = cartTotal(items);

  useEffect(() => {
    if (!hydrated) return;
    if (!items.length) {
      router.replace("/carrinho");
      return;
    }
    if (identified) return;
    startTransition(async () => {
      const result = await startAnonymousSession();
      setIdentified(result.ok);
      if (!result.ok) setMessage(result.message ?? "Não foi possível iniciar sua sessão de visitante.");
    });
  }, [hydrated, identified, items.length, router]);

  const useSaved = saved.find((address) => address.id === selectedAddress);

  const submit = () =>
    startTransition(async () => {
      if (!identified) {
        setMessage("Não foi possível iniciar a sessão de visitante. Recarregue a página e tente novamente.");
        return;
      }
      if (!customer.nome.trim() || !customer.email.includes("@")) {
        setMessage("Informe nome e e-mail válidos.");
        return;
      }
      if (!consent) {
        setMessage("O consentimento com a política de privacidade é obrigatório.");
        return;
      }
      const result = await createOrder({
        customer,
        items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity, optionIds: item.options.map((option) => option.optionId), addonIds: item.addons.map((addon) => addon.addonId), observation: item.observation })),
        addressId: useSaved?.id,
        address: useSaved ? undefined : form,
        formaPagamento: payment,
        observacoes: form.observacoes,
        couponCode: coupon || undefined,
        consentAccepted: consent,
      });
      if (!result.ok) {
        setMessage(result.message ?? "Não foi possível criar o pedido.");
        return;
      }
      clear();
      router.push(payment === "na_entrega" ? `/pedido/${result.orderId}` : `/pedido/${result.orderId}/pagamento`);
    });

  const applyCoupon = () =>
    startTransition(async () => {
      const result = await validateCoupon(coupon, total);
      setDiscount(result.valid ? result.desconto || 0 : 0);
      setMessage(result.message || "");
    });

  if (!hydrated || !identified) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4 py-10 md:px-6">
        <Card className="w-full rounded-3xl p-8 text-center shadow-[0_20px_60px_rgba(17,17,17,.08)]">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-[var(--color-primary)]" aria-hidden="true" />
          <p className="mt-4 font-semibold">Preparando seu pedido…</p>
          {message && <p className="mt-2 text-sm text-[var(--color-danger)]" role="status">{message}</p>}
        </Card>
      </main>
    );
  }

  return <main className="mx-auto max-w-3xl px-4 py-6 md:px-6"><h1 className="text-3xl font-extrabold">Finalizar pedido</h1><div className="mt-6 grid gap-5"><Card><h2 className="font-bold">Seus dados</h2><div className="mt-3 grid gap-3"><Input placeholder="Seu nome" value={customer.nome} onChange={e=>setCustomer({...customer,nome:e.target.value})}/><Input type="email" placeholder="Seu e-mail" value={customer.email} onChange={e=>setCustomer({...customer,email:e.target.value})}/><p className="text-xs text-black/55">Seu pedido fica vinculado a este navegador para facilitar novos pedidos.</p></div></Card><Card><h2 className="font-bold">Endereço</h2>{saved.length>0&&<div className="mt-3 grid gap-2"><p className="text-sm opacity-70">Escolha um endereço salvo ou cadastre um novo.</p>{saved.map(a=><label key={a.id} className="flex gap-2 rounded-md border p-3 text-sm"><input type="radio" checked={selectedAddress===a.id} onChange={()=>setSelectedAddress(a.id)}/><span>{a.rotulo||"Endereço"}: {a.rua}, {a.numero} — {a.bairro}</span></label>)}<label className="flex gap-2 text-sm"><input type="radio" checked={!useSaved} onChange={()=>setSelectedAddress("")}/> Novo endereço</label></div>}{!useSaved&&<div className="mt-3 grid gap-3 sm:grid-cols-2"><Input placeholder="Rua" value={form.rua} onChange={e=>setForm({...form,rua:e.target.value})}/><Input placeholder="Número" value={form.numero} onChange={e=>setForm({...form,numero:e.target.value})}/><Input placeholder="Complemento" value={form.complemento} onChange={e=>setForm({...form,complemento:e.target.value})}/><Input placeholder="Bairro" value={form.bairro} onChange={e=>setForm({...form,bairro:e.target.value})}/><Input placeholder="Cidade" value={form.cidade} onChange={e=>setForm({...form,cidade:e.target.value})}/><Input placeholder="CEP" value={form.cep} onChange={e=>setForm({...form,cep:e.target.value})}/><Input className="sm:col-span-2" placeholder="Ponto de referência" value={form.referencia} onChange={e=>setForm({...form,referencia:e.target.value})}/></div>}</Card><Card><h2 className="font-bold">Cupom</h2><div className="mt-3 flex gap-2"><Input value={coupon} onChange={e=>setCoupon(e.target.value.toUpperCase())} placeholder="Código"/><Button variant="outline" onClick={applyCoupon} disabled={pending}>Aplicar</Button></div></Card><Card><h2 className="font-bold">Pagamento</h2><div className="mt-3 grid gap-2"><label><input type="radio" checked={payment==="pix"} onChange={()=>setPayment("pix")}/> Pix</label><label><input type="radio" checked={payment==="cartao"} onChange={()=>setPayment("cartao")}/> Cartão</label><label><input type="radio" checked={payment==="na_entrega"} onChange={()=>setPayment("na_entrega")}/> Na entrega</label></div></Card><Card><Textarea placeholder="Observações do pedido" value={form.observacoes} onChange={e=>setForm({...form,observacoes:e.target.value})}/><label className="mt-4 flex items-start gap-2 text-sm"><Checkbox checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>Concordo com a <a className="underline" href="/politica-de-privacidade">política de privacidade</a>.</span></label><div className="mt-5 flex items-center justify-between font-bold"><span>Total</span><span>R$ {Math.max(0,total-discount).toFixed(2).replace(".", ",")}</span></div><Button size="lg" className="mt-4 w-full" onClick={submit} disabled={pending||!items.length}>{pending?"Processando…":"Confirmar pedido"}</Button>{message&&<p className="mt-3 text-sm" role="status">{message}</p>}</Card></div></main>;
}
