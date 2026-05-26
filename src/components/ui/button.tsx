"use client";

import { cn } from "@/lib/utils";
import { forwardRef, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[#C44820] text-[#F5F0E8] hover:bg-[#D95428] active:bg-[#B03D1A] border border-[#C44820]",
  secondary:
    "bg-[#1E1E1E] text-[#F5F0E8] hover:bg-[#252525] active:bg-[#2A2A2A] border border-[#2A2A2A]",
  ghost:
    "bg-transparent text-[#8A8578] hover:text-[#F5F0E8] hover:bg-[#1E1E1E] border border-transparent",
  danger:
    "bg-transparent text-red-400 hover:bg-red-950/30 border border-red-900/40",
  outline:
    "bg-transparent text-[#F5F0E8] hover:bg-[#1E1E1E] border border-[#2A2A2A]",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-7 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-11 px-6 text-base gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "secondary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-body font-medium tracking-wide",
          "rounded-[4px] transition-all duration-150",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#C44820]",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
