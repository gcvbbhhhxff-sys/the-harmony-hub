import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) { return <textarea ref={ref} className={cn("min-h-24 w-full resize-y rounded-md border border-black/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15 disabled:opacity-50", className)} {...props} />; });
Textarea.displayName = "Textarea";
