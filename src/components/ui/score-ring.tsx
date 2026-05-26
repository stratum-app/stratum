"use client";

import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  sublabel?: string;
  className?: string;
}

const sizeConfig = {
  sm: { dim: 56, stroke: 3, r: 22, fontSize: "text-sm", labelSize: "text-[9px]" },
  md: { dim: 88, stroke: 4, r: 36, fontSize: "text-xl", labelSize: "text-[10px]" },
  lg: { dim: 128, stroke: 5, r: 54, fontSize: "text-3xl", labelSize: "text-xs" },
};

function scoreToColor(score: number): string {
  if (score >= 80) return "#C44820";
  if (score >= 60) return "#8A6C20";
  if (score >= 40) return "#4A7AA8";
  return "#2A2A2A";
}

export function ScoreRing({ score, size = "md", label, sublabel, className }: ScoreRingProps) {
  const cfg = sizeConfig[size];
  const circumference = 2 * Math.PI * cfg.r;
  const progress = Math.max(0, Math.min(100, score));
  const offset = circumference - (progress / 100) * circumference;
  const color = scoreToColor(score);

  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      <div className="relative" style={{ width: cfg.dim, height: cfg.dim }}>
        <svg
          width={cfg.dim}
          height={cfg.dim}
          viewBox={`0 0 ${cfg.dim} ${cfg.dim}`}
          className="-rotate-90"
        >
          {/* Track */}
          <circle
            cx={cfg.dim / 2}
            cy={cfg.dim / 2}
            r={cfg.r}
            fill="none"
            stroke="#1E1E1E"
            strokeWidth={cfg.stroke}
          />
          {/* Progress */}
          <circle
            cx={cfg.dim / 2}
            cy={cfg.dim / 2}
            r={cfg.r}
            fill="none"
            stroke={color}
            strokeWidth={cfg.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.4s ease" }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn("font-display font-light leading-none text-[#F5F0E8]", cfg.fontSize)}
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
          >
            {score}
          </span>
          {size !== "sm" && (
            <span className={cn("text-[#4A4640] font-body uppercase tracking-widest", cfg.labelSize)}>
              /100
            </span>
          )}
        </div>
      </div>
      {label && (
        <div className="text-center">
          <p className="text-xs font-medium text-[#8A8578] uppercase tracking-wider">{label}</p>
          {sublabel && <p className="text-[11px] text-[#4A4640]">{sublabel}</p>}
        </div>
      )}
    </div>
  );
}
