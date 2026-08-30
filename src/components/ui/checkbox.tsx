import { cn } from "@/lib/utils/cn";
type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;
export function Checkbox({ className, ...props }: CheckboxProps) { return <input type="checkbox" className={cn("h-4 w-4 rounded border-black/25 accent-[var(--color-primary)]", className)} {...props} />; }
