"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { calculateItemUnitPrice } from "@/domains/cart/pricing";
import { areSelectionsValid, buildSelectedAddons, buildSelectedOptions, getInitialSelections, toggleSelection } from "@/domains/cart/selection";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useCartStore } from "@/lib/cart/store";
import type { Product } from "@/types/menu";
import type { CartItem, MenuAddon, MenuOption, MenuOptionGroup } from "@/types/cart";

type Props={product:Product;groups:MenuOptionGroup[];options:MenuOption[];addons:MenuAddon[];availableAddonIds:string[];open:boolean;onClose:()=>void;existingItem?:CartItem};

export function ProductDetail({product,groups,options,addons,availableAddonIds,open,onClose,existingItem}:Props){
 const addItem=useCartStore((state)=>state.addItem);
 const replaceItem=useCartStore((state)=>state.replaceItem);
 const [selected,setSelected]=useState<Record<string,string[]>>(()=>getInitialSelections(groups,existingItem));
 const [selectedAddons,setSelectedAddons]=useState<string[]>(()=>existingItem?.addons.map((addon)=>addon.addonId)??[]);
 const [observation,setObservation]=useState(existingItem?.observation??"");
 const [quantity,setQuantity]=useState(Math.max(1,existingItem?.quantity??1));

 useEffect(()=>{
  if(!open)return;
  setSelected(getInitialSelections(groups,existingItem));
  setSelectedAddons(existingItem?.addons.map((addon)=>addon.addonId)??[]);
  setObservation(existingItem?.observation??"");
  setQuantity(Math.max(1,existingItem?.quantity??1));
 },[groups,existingItem,open]);

 const chosenOptions=useMemo(()=>buildSelectedOptions(selected,options),[options,selected]);
 const chosenAddons=useMemo(()=>buildSelectedAddons(selectedAddons,addons),[addons,selectedAddons]);
 const valid=useMemo(()=>areSelectionsValid(groups,selected),[groups,selected]);
 const unitPrice=useMemo(()=>calculateItemUnitPrice(product.preco,chosenOptions,chosenAddons),[chosenAddons,chosenOptions,product.preco]);

 const confirm=()=>{
  if(!valid||quantity<1)return;
  const item:CartItem={id:existingItem?.id??crypto.randomUUID(),product,options:chosenOptions,addons:chosenAddons,observation:observation.trim(),quantity,unitPrice};
  if(existingItem)replaceItem(existingItem.id,item);else addItem(item);
  onClose();
 };

 const content=<div className="grid gap-5">
  {product.imagem_url&&<Image src={product.imagem_url} alt={product.nome} width={640} height={480} className="aspect-[4/3] w-full rounded-xl object-cover" unoptimized/>}
  <div><h2 className="text-2xl font-black">{product.nome}</h2>{product.descricao&&<p className="mt-1 text-sm text-[var(--color-muted)]">{product.descricao}</p>}</div>
  {groups.map((group)=>{const multiple=group.max_select>1;const groupOptions=options.filter((option)=>option.group_id===group.id&&option.ativo);const selectedForGroup=selected[group.id]??[];return <fieldset key={group.id} className="grid gap-2"><legend className="font-bold">{group.nome} {group.obrigatorio&&<span className="text-[var(--color-danger)]" aria-label="Obrigatório">*</span>}</legend>{groupOptions.map((option)=>{const checked=selectedForGroup.includes(option.id);return <label key={option.id} className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"><span>{option.nome}{option.preco_extra>0?` (+ R$ ${option.preco_extra.toFixed(2).replace(".",",")})`:""}</span>{multiple?<Checkbox checked={checked} onChange={()=>setSelected((previous)=>toggleSelection(previous,group,option.id))}/>:<input type="radio" name={`group-${group.id}-${product.id}`} checked={checked} onChange={()=>setSelected((previous)=>({...previous,[group.id]:[option.id]}))} className="h-5 w-5 accent-[var(--color-primary)]" aria-label={`${group.nome}: ${option.nome}`}/>}</label>})}</fieldset>})}
  {availableAddonIds.length>0&&<fieldset className="grid gap-2"><legend className="font-bold">Adicionais</legend>{addons.filter((addon)=>addon.ativo&&availableAddonIds.includes(addon.id)).map((addon)=><label key={addon.id} className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"><span>{addon.nome} (+ R$ {addon.preco.toFixed(2).replace(".",",")})</span><Checkbox checked={selectedAddons.includes(addon.id)} onChange={()=>setSelectedAddons((current)=>current.includes(addon.id)?current.filter((value)=>value!==addon.id):[...current,addon.id])}/></label>)}</fieldset>}
  <Textarea value={observation} onChange={(event)=>setObservation(event.target.value)} placeholder="Observação do item" aria-label="Observação do item"/>
  <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-2"><Button type="button" variant="outline" size="sm" className="h-11 w-11 rounded-full p-0" onClick={()=>setQuantity((current)=>Math.max(1,current-1))} aria-label="Diminuir quantidade">−</Button><span className="min-w-8 text-center font-bold" aria-live="polite">{quantity}</span><Button type="button" variant="outline" size="sm" className="h-11 w-11 rounded-full p-0" onClick={()=>setQuantity((current)=>current+1)} aria-label="Aumentar quantidade">+</Button></div><strong className="text-lg font-black text-[var(--color-primary-dark)]">R$ {(unitPrice*quantity).toFixed(2).replace(".",",")}</strong></div>
  <Button type="button" size="lg" disabled={!valid} onClick={confirm} className="h-12 w-full rounded-xl">{existingItem?"Salvar alterações":"Adicionar ao pedido"}</Button>
 </div>;
 return <><div className="hidden md:block"><Dialog open={open} onClose={onClose} title="Personalizar pedido">{content}</Dialog></div><div className="md:hidden"><BottomSheet open={open} onClose={onClose} title="Personalizar pedido">{content}</BottomSheet></div></>;
}
