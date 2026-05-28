import type { SVGProps } from "react";

const BARS = [
  { x: 68, w: 80  },
  { x: 30, w: 130 },
  { x: 0,  w: 166 },
  { x: 20, w: 144 },
  { x: 58, w: 88  },
  { x: 40, w: 124 },
  { x: 34, w: 156 },
  { x: 40, w: 136 },
  { x: 58, w: 88  },
];

const COLORS = [
  "#D4552C", "#C34C27", "#B24322", "#A03A1C",
  "#8F3217", "#7E2912", "#6D200D", "#5B1707", "#4A0E02",
];

const BAR_H = 8;
const GAP   = 2.5;
const VB_W  = 190;
const VB_H  = 9 * BAR_H + 8 * GAP; // 92

interface StratumMarkProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function StratumMark({ size = 32, className, ...rest }: StratumMarkProps) {
  const w = Math.round((size * VB_W) / VB_H);
  return (
    <svg
      width={w}
      height={size}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Stratum"
      className={className}
      {...rest}
    >
      {BARS.map((bar, i) => (
        <rect
          key={i}
          x={bar.x}
          y={i * (BAR_H + GAP)}
          width={bar.w}
          height={BAR_H}
          rx={2.5}
          fill={COLORS[i]}
        />
      ))}
    </svg>
  );
}
