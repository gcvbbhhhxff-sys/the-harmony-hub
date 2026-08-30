import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, ...props }, ref) { return <select ref={ref} className={cn("h-10 w-full rounded-md border border-black/15 bg-white px-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15", className)} {...props} />; });
Select.displayName = "Select";
