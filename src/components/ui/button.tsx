import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive"; size?: "sm" | "md" | "lg"; loading?: boolean };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ className, variant = "primary", size = "md", loading = false, disabled, children, ...props }, ref) {
  const variants = { primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]", secondary: "bg-[var(--color-secondary)] text-white", outline: "border border-black/20 bg-transparent hover:bg-black/5", ghost: "bg-transparent hover:bg-black/5", destructive: "bg-[var(--color-danger)] text-white" };
  const sizes = { sm: "min-h-9 px-3 text-sm", md: "min-h-10 px-4", lg: "min-h-12 px-5 text-base" };
  return <button ref={ref} disabled={disabled || loading} className={cn("inline-flex items-center justify-center rounded-md font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50", variants[variant], sizes[size], className)} aria-busy={loading || undefined} {...props}>{loading ? "Carregando…" : children}</button>;
});
Button.displayName = "Button";
