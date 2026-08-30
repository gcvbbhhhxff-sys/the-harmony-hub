import { Logo } from "@/components/ui/logo";

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

export function BrandLogo({ compact = false, className = "" }: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Logo size={compact ? 42 : 54} className="shrink-0 drop-shadow-[0_4px_14px_rgba(0,0,0,.28)]" />
      <span className="min-w-0 leading-none">
        <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-[#f2bd2d] sm:text-[10px]">Restaurante</span>
        <span className="mt-0.5 block truncate text-[14px] font-black uppercase tracking-[0.04em] text-white sm:text-[16px]">Tabajara's</span>
        <span className="mt-0.5 block truncate text-[8px] font-extrabold uppercase tracking-[0.23em] text-white/80 sm:text-[9px]">Churrascaria</span>
      </span>
    </span>
  );
}
