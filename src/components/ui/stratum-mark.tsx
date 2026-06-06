import type { SVGProps } from "react";

// 5 clean strata bars — simple, geological, intentional
const BARS = [
  { x: 12, w: 56 },
  { x: 4,  w: 72 },
  { x: 0,  w: 80 },
  { x: 4,  w: 64 },
  { x: 12, w: 48 },
];

const COLORS = ["#D4552C", "#B84420", "#9B3415", "#7E240B", "#621503"];

const BAR_H = 5;
const GAP   = 3;
const VB_W  = 80;
const VB_H  = 5 * BAR_H + 4 * GAP; // 37

interface StratumMarkProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function StratumMark({ size = 28, className, ...rest }: StratumMarkProps) {
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
          rx={2}
          fill={COLORS[i]}
        />
      ))}
    </svg>
  );
}
