import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover, onClick }: CardProps) {
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      onClick={onClick}
      className={cn(
        "rounded-[6px] bg-[#161616] border border-[#1F1F1F]",
        "text-left w-full",
        hover && "hover:border-[#2A2A2A] hover:bg-[#1A1A1A] transition-all duration-150 cursor-pointer",
        onClick && "focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#C44820]",
        className
      )}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-5 pt-5 pb-4 border-b border-[#1F1F1F]", className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-5 py-4 border-t border-[#1F1F1F]", className)}>
      {children}
    </div>
  );
}
