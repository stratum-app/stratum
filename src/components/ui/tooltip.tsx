"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  width?: string;
}

export function Tooltip({ content, children, className, width = "w-56" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className={cn("relative inline-flex items-center", className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={cn(
            "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50",
            width,
            "bg-[#1E1E1E] border border-[#2A2A2A] rounded-[4px]",
            "p-3 text-xs text-[#8A8578] font-body leading-relaxed shadow-xl",
            "pointer-events-none"
          )}
        >
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#2A2A2A]" />
        </div>
      )}
    </div>
  );
}

export function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      fill="none"
      viewBox="0 0 12 12"
      className={cn("text-[#4A4640] hover:text-[#8A8578] transition-colors cursor-default", className)}
    >
      <circle cx="6" cy="6" r="5.25" stroke="currentColor" strokeWidth="1.25" />
      <path d="M6 5.5v3M6 3.5v.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}
