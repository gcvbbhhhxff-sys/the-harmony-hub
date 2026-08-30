"use client";
import { cn } from "@/lib/utils/cn";
type BottomSheetProps={open:boolean;onClose:()=>void;title?:string;children:React.ReactNode};
export function BottomSheet({open,onClose,title,children}:BottomSheetProps){if(!open)return null;return <div className="fixed inset-0 z-50"><button type="button" aria-label="Fechar" className="absolute inset-0 h-full w-full bg-black/40" onClick={onClose}/><section className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl" role="dialog" aria-modal="true"><div className="mx-auto mb-4 h-1 w-10 rounded-full bg-black/20"/>{title&&<h2 className="text-lg font-semibold">{title}</h2>}<div className={cn(title&&"mt-4")}>{children}</div></section></div>}
