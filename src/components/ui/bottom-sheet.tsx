"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils/cn";

type BottomSheetProps={open:boolean;onClose:()=>void;title?:string;children:React.ReactNode};

export function BottomSheet({open,onClose,title,children}:BottomSheetProps){
 useEffect(()=>{
  if(!open)return;
  const html=document.documentElement;
  const body=document.body;
  const scrollY=window.scrollY;
  const previousBodyOverflow=body.style.overflow;
  const previousBodyPosition=body.style.position;
  const previousBodyTop=body.style.top;
  const previousBodyWidth=body.style.width;
  const previousHtmlOverscroll=html.style.overscrollBehavior;
  body.style.overflow="hidden";
  body.style.position="fixed";
  body.style.top=`-${scrollY}px`;
  body.style.width="100%";
  html.style.overscrollBehavior="none";
  return()=>{
   body.style.overflow=previousBodyOverflow;
   body.style.position=previousBodyPosition;
   body.style.top=previousBodyTop;
   body.style.width=previousBodyWidth;
   html.style.overscrollBehavior=previousHtmlOverscroll;
   window.scrollTo(0,scrollY);
  };
 },[open]);

 if(!open)return null;
 return <div className="fixed inset-0 z-[100] touch-none" role="presentation">
  <button type="button" aria-label="Fechar" className="absolute inset-0 z-0 h-full w-full bg-black/40" onClick={onClose}/>
  <section className="absolute bottom-0 left-0 right-0 z-10 max-h-[90vh] overflow-y-auto overscroll-contain touch-pan-y rounded-t-2xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl" role="dialog" aria-modal="true" aria-labelledby={title?"bottom-sheet-title":undefined} onClick={(event)=>event.stopPropagation()} onPointerDown={(event)=>event.stopPropagation()}>
   <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-black/20"/>
   {title&&<h2 id="bottom-sheet-title" className="text-lg font-semibold">{title}</h2>}
   <div className={cn(title&&"mt-4")}>{children}</div>
  </section>
 </div>;
}
