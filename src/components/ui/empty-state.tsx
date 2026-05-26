import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6",
        className
      )}
    >
      {icon && (
        <div className="mb-5 text-[#2A2A2A]">
          {icon}
        </div>
      )}
      <h3
        className="font-display text-xl font-light text-[#F5F0E8] mb-2"
        style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
      >
        {title}
      </h3>
      <p className="text-sm text-[#4A4640] font-body max-w-xs leading-relaxed mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
