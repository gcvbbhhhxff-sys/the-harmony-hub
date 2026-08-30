"use client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";
type DialogProps={open:boolean;onClose:()=>void;title:string;children:React.ReactNode;className?:string};
export function Dialog({open,onClose,title,children,className}:DialogProps){const ref=useRef<HTMLDialogElement>(null);useEffect(()=>{const el=ref.current;if(!el)return;if(open&&!el.open)el.showModal();if(!open&&el.open)el.close();},[open]);return <dialog ref={ref} onCancel={onClose} className={cn("w-[min(92vw,560px)] rounded-xl border-0 p-0 shadow-2xl backdrop:bg-black/40",className)}><div className="p-6"><div className="flex items-center justify-between gap-4"><h2 className="text-lg font-semibold">{title}</h2><button type="button" onClick={onClose} aria-label="Fechar">×</button></div><div className="mt-5">{children}</div></div></dialog>}
