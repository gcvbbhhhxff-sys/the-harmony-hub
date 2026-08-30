"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
type Toast={id:number;message:string;kind:"success"|"error"|"info"};type ToastContextValue={show:(message:string,kind?:Toast["kind"])=>void};
const ToastContext=createContext<ToastContextValue|null>(null);
export function ToastProvider({children}:{children:React.ReactNode}){const [items,setItems]=useState<Toast[]>([]);const show=useCallback((message:string,kind:Toast["kind"]="info")=>{const id=Date.now()+Math.random();setItems(v=>[...v,{id,message,kind}]);window.setTimeout(()=>setItems(v=>v.filter(t=>t.id!==id)),3500)},[]);const value=useMemo(()=>({show}),[show]);return <ToastContext.Provider value={value}>{children}<div className="fixed right-4 top-4 z-[60] grid w-[min(92vw,360px)] gap-2">{items.map(t=><div key={t.id} className="rounded-lg border bg-white p-3 text-sm shadow-lg">{t.message}</div>)}</div></ToastContext.Provider>}
export function useToast(){const value=useContext(ToastContext);if(!value)throw new Error("useToast deve ser usado dentro de ToastProvider");return value;}
