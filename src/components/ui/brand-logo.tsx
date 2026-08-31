"use client";

import Image from "next/image";
import { Logo } from "@/components/ui/logo";
import { useRestaurantBrand } from "@/components/cliente/restaurant-brand-provider";

type BrandLogoProps = { compact?: boolean; className?: string };

export function BrandLogo({ compact = false, className = "" }: BrandLogoProps) {
  const { nome, logoUrl } = useRestaurantBrand();
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {logoUrl ? (
        <span className="relative block shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-[0_8px_26px_rgba(0,0,0,.16)]" style={{ width: compact ? 42 : 54, height: compact ? 42 : 54 }}>
          <Image src={logoUrl} alt={nome} fill sizes={compact ? "42px" : "54px"} className="object-contain p-1" unoptimized />
        </span>
      ) : (
        <Logo size={compact ? 42 : 54} className="shrink-0 drop-shadow-[0_6px_18px_rgba(0,0,0,.30)]" />
      )}
      <span className="min-w-0 leading-none">
        <span className="block text-[9px] font-black uppercase tracking-[0.22em] text-[#f2bd2d] sm:text-[10px]">Restaurante</span>
        <span className="mt-1 block max-w-[190px] truncate text-[14px] font-black uppercase tracking-[0.055em] text-white sm:text-[16px]">{nome}</span>
        <span className="mt-1 block truncate text-[8px] font-extrabold uppercase tracking-[0.28em] text-white/65 sm:text-[9px]">Delivery</span>
      </span>
    </span>
  );
}
