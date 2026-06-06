"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  width?: string;
}

export function Tooltip({ content, children, className, width = "w-56" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<{ above: boolean; alignRight: boolean }>({
    above: true,
    alignRight: false,
  });
  const wrapRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Flip above/below: show below if less than 120px above
    const above = rect.top > 120;
    // Align right if tooltip would overflow right edge
    // Approximate tooltip width from the width prop (e.g. "w-56" = 224px)
    const tipWidth = 224;
    const alignRight = rect.left + tipWidth / 2 > vw - 16;
    setPos({ above, alignRight });
  }, [visible]);

  const positionClasses = cn(
    "absolute z-50",
    pos.above ? "bottom-full mb-2" : "top-full mt-2",
    pos.alignRight ? "right-0" : "left-1/2 -translate-x-1/2"
  );

  return (
    <div
      ref={wrapRef}
      className={cn("relative inline-flex items-center", className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div ref={tipRef} className={positionClasses}>
          <div
            className={cn(
              width,
              "bg-[#1E1E1E] border border-[#2A2A2A] rounded-[4px]",
              "p-3 text-xs text-[#8A8578] font-body leading-relaxed shadow-xl",
              "pointer-events-none"
            )}
          >
            {content}
          </div>
          {/* Arrow */}
          {pos.above ? (
            <div className={cn(
              "absolute top-full border-4 border-transparent border-t-[#2A2A2A]",
              pos.alignRight ? "right-3" : "left-1/2 -translate-x-1/2"
            )} />
          ) : (
            <div className={cn(
              "absolute bottom-full border-4 border-transparent border-b-[#2A2A2A]",
              pos.alignRight ? "right-3" : "left-1/2 -translate-x-1/2"
            )} />
          )}
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
