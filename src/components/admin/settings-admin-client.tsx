"use client";
import { useRef, useState, useTransition } from "react";
import { saveRestaurantSettings, uploadRestaurantLogo } from "@/server/actions/admin-config";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

type Form = {
  nome: string;
  logo_url: string;
  taxa_base_entrega: number;
  valor_minimo_pedido: number;
  chave_pix: string;
  whatsapp: string;
  tempo_estimado: string;
  horario_funcionamento: Record<string, { abertura: string; fechamento: string; ativo: boolean }>;
};

export default function SettingsAdminClient({ initial }: { initial: Form }) {
  const [form, setForm] = useState(initial);
  const [msg, setMsg] = useState("");
  const [pending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  const days = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];

  const save = () => startTransition(async () => {
    const result = await saveRestaurantSettings(form);
    setMsg(result.ok ? "Configurações salvas." : result.message || "Erro.");
  });

  const uploadLogo = () => {
    const file = fileInput.current?.files?.[0];
    if (!file) return;
    startTransition(async () => {
      const data = new FormData();
      data.append("file", file);
      const result = await uploadRestaurantLogo(data);
      setMsg(result.ok ? "Logo atualizada." : result.message || "Não foi possível enviar a logo.");
      if (result.ok && result.url) setForm((current) => ({ ...current, logo_url: result.url! }));
    });
  };

  return (
    <main className="p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl bg-[#0d1013] p-5 text-white shadow-[0_20px_55px_rgba(13,16,19,.16)] sm:p-7">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f4bf32]">Identidade do restaurante</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">Configurações</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/65">Controle o nome, a marca, atendimento e regras que aparecem no site do cliente.</p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <Card className="rounded-3xl border-black/5 p-5 shadow-[0_15px_40px_rgba(17,17,17,.06)] sm:p-6">
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#aa7f18]">Marca</p>
              <h2 className="mt-1 text-xl font-black">Aparência do site</h2>
            </div>
            <div className="grid gap-4">
              <div><label className="mb-1.5 block text-xs font-bold text-[#6f6a62]">Nome exibido</label><Input placeholder="Nome do restaurante" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="h-11 rounded-xl" /></div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#6f6a62]">URL da logo</label>
                <div className="flex gap-2"><Input placeholder="https://..." value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} className="h-11 rounded-xl" /><Button type="button" variant="outline" className="h-11 rounded-xl" onClick={() => fileInput.current?.click()} disabled={pending}>Enviar</Button></div>
                <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={uploadLogo} />
              </div>
              <div className="rounded-2xl bg-[#faf9f5] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#aa7f18]">Prévia</p>
                <div className="mt-3 flex min-h-24 items-center justify-center overflow-hidden rounded-xl bg-[#0d1013] p-5">
                  {form.logo_url ? <img src={form.logo_url} alt="Logo do restaurante" className="max-h-16 max-w-full object-contain" /> : <p className="text-xs text-white/50">Sem logo personalizada — o logo padrão será usado.</p>}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="mb-1.5 block text-xs font-bold text-[#6f6a62]">Taxa base de entrega</label><Input type="number" min="0" step="0.01" value={form.taxa_base_entrega} onChange={(e) => setForm({ ...form, taxa_base_entrega: Number(e.target.value) })} className="h-11 rounded-xl" /></div>
                <div><label className="mb-1.5 block text-xs font-bold text-[#6f6a62]">Pedido mínimo</label><Input type="number" min="0" step="0.01" value={form.valor_minimo_pedido} onChange={(e) => setForm({ ...form, valor_minimo_pedido: Number(e.target.value) })} className="h-11 rounded-xl" /></div>
              </div>
              <div><label className="mb-1.5 block text-xs font-bold text-[#6f6a62]">Chave Pix</label><Input placeholder="Chave Pix" value={form.chave_pix} onChange={(e) => setForm({ ...form, chave_pix: e.target.value })} className="h-11 rounded-xl" /></div>
              <div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-1.5 block text-xs font-bold text-[#6f6a62]">WhatsApp</label><Input placeholder="(00) 00000-0000" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="h-11 rounded-xl" /></div><div><label className="mb-1.5 block text-xs font-bold text-[#6f6a62]">Prazo estimado</label><Input placeholder="40-60 minutos" value={form.tempo_estimado} onChange={(e) => setForm({ ...form, tempo_estimado: e.target.value })} className="h-11 rounded-xl" /></div></div>
            </div>
          </Card>

          <Card className="rounded-3xl border-black/5 p-5 shadow-[0_15px_40px_rgba(17,17,17,.06)] sm:p-6">
            <div className="mb-5"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#aa7f18]">Atendimento</p><h2 className="mt-1 text-xl font-black">Horários</h2></div>
            <div className="grid gap-2">
              {days.map((day) => {
                const item = form.horario_funcionamento[day] ?? { abertura: "11:00", fechamento: "15:00", ativo: false };
                return <div key={day} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded-2xl bg-[#faf9f5] p-3"><label className="flex min-w-0 items-center gap-2 text-sm font-semibold capitalize"><Checkbox checked={item.ativo} onChange={(e) => setForm({ ...form, horario_funcionamento: { ...form.horario_funcionamento, [day]: { ...item, ativo: e.target.checked } } })}/><span className="truncate">{day}</span></label><Input aria-label={`Abertura ${day}`} type="time" value={item.abertura} onChange={(e) => setForm({ ...form, horario_funcionamento: { ...form.horario_funcionamento, [day]: { ...item, abertura: e.target.value } } })} className="h-10 rounded-xl"/><Input aria-label={`Fechamento ${day}`} type="time" value={item.fechamento} onChange={(e) => setForm({ ...form, horario_funcionamento: { ...form.horario_funcionamento, [day]: { ...item, fechamento: e.target.value } } })} className="h-10 rounded-xl"/></div>;
              })}
            </div>
          </Card>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center"><Button className="h-12 rounded-xl bg-[#f4bf32] px-6 font-black text-black hover:bg-[#e3ae22]" disabled={pending} onClick={save}>{pending ? "Salvando…" : "Salvar configurações"}</Button>{msg&&<p className="text-sm font-medium" role="status">{msg}</p>}</div>
      </div>
    </main>
  );
}
