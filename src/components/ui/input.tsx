"use client";

import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-[#8A8578] tracking-wider uppercase"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-9 w-full rounded-[4px] bg-[#161616] border border-[#2A2A2A]",
            "px-3 text-sm text-[#F5F0E8] font-body",
            "placeholder:text-[#4A4640]",
            "focus:outline-none focus:border-[#C44820] focus:ring-0",
            "transition-colors duration-150",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            error && "border-red-800 focus:border-red-600",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-[#4A4640]">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
