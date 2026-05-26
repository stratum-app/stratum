import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "accent" | "success" | "warning" | "muted" | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[#1E1E1E] text-[#8A8578] border-[#2A2A2A]",
  accent: "bg-[#7A2C14]/20 text-[#C44820] border-[#7A2C14]/40",
  success: "bg-[#4A8C5C]/15 text-[#4A8C5C] border-[#4A8C5C]/30",
  warning: "bg-[#B8860B]/15 text-[#B8860B] border-[#B8860B]/30",
  muted: "bg-transparent text-[#4A4640] border-[#1F1F1F]",
  outline: "bg-transparent text-[#8A8578] border-[#2A2A2A]",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px]",
        "text-xs font-medium font-body border",
        "tracking-wide",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
