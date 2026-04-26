/**
 * Pure-SVG card back. Mimics the quilted dot texture of real Korean hwatu
 * card backs — dense grid of dimples (darker corners) and bumps (light cell
 * highlights) on a matte red field. No external asset, no license worry.
 *
 * Renders as an inline <svg> filling its container (like HwatuCardImage),
 * so the caller controls shape, ring, and motion via the wrapper.
 */

"use client";

import { useId } from "react";

type Props = {
  className?: string;
  ariaLabel?: string;
};

export function HwatuCardBack({
  className,
  ariaLabel = "Card back",
}: Props) {
  const patternId = useId();
  return (
    <svg
      className={className}
      viewBox="0 0 200 300"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={ariaLabel}
    >
      <defs>
        <pattern
          id={patternId}
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          {/* dimple — darker dot at grid intersection */}
          <circle
            cx="0"
            cy="0"
            r="1.2"
            fill="var(--mat-deep)"
            fillOpacity="0.6"
          />
          <circle
            cx="10"
            cy="0"
            r="1.2"
            fill="var(--mat-deep)"
            fillOpacity="0.6"
          />
          <circle
            cx="0"
            cy="10"
            r="1.2"
            fill="var(--mat-deep)"
            fillOpacity="0.6"
          />
          <circle
            cx="10"
            cy="10"
            r="1.2"
            fill="var(--mat-deep)"
            fillOpacity="0.6"
          />
          {/* bump — light highlight in cell center */}
          <circle
            cx="5"
            cy="5"
            r="1.6"
            fill="var(--paper)"
            fillOpacity="0.16"
          />
        </pattern>
      </defs>

      <rect width="200" height="300" fill="var(--mat)" />
      <rect width="200" height="300" fill={`url(#${patternId})`} />
    </svg>
  );
}
