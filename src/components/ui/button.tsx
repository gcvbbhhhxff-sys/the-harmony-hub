import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive"; size?: "sm" | "md" | "lg"; loading?: boolean };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ className, variant = "primary", size = "md", loading = false, disabled, children, ...props }, ref) {
  const variants = {
    primary: "bg-[var(--color-primary)] text-black shadow-[0_10px_24px_rgba(185,143,25,.18)] hover:bg-[var(--color-primary-dark)] hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(185,143,25,.24)]",
    secondary: "bg-[var(--color-secondary)] text-white shadow-[0_10px_24px_rgba(13,16,19,.14)] hover:bg-[#171b20] hover:-translate-y-0.5",
    outline: "border border-black/12 bg-white/70 shadow-[0_6px_18px_rgba(17,17,17,.04)] hover:border-black/20 hover:bg-white hover:-translate-y-0.5",
    ghost: "bg-transparent hover:bg-black/5 hover:-translate-y-0.5",
    destructive: "bg-[var(--color-danger)] text-white shadow-[0_10px_24px_rgba(179,38,30,.16)] hover:brightness-95 hover:-translate-y-0.5",
  };
  const sizes = { sm: "min-h-9 px-3 text-sm", md: "min-h-10 px-4", lg: "min-h-12 px-5 text-base" };
  return <button ref={ref} disabled={disabled || loading} className={cn("inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0", variants[variant], sizes[size], className)} aria-busy={loading || undefined} {...props}>{loading ? "Carregando…" : children}</button>;
});
Button.displayName = "Button";
