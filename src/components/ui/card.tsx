import { cn } from "@/lib/utils/cn";
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn("rounded-lg border border-black/10 bg-white p-5 shadow-sm", className)} {...props} />; }
