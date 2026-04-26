"use client";

import { motion } from "motion/react";

export type Toss = {
  /** Final horizontal offset (px) on landing. */
  x: number;
  /** Final z-axis tilt (deg) on landing. */
  tilt: number;
};

/**
 * A single yut stick. Two faces (flat / round) layered with backface-hidden
 * so only one face shows at any rotation. When `throwId` is provided the
 * stick performs a tossed-into-the-air arc: lifts up, tumbles, scatters,
 * lands at `toss.x` with a small `toss.tilt` rotation.
 */
export function YutStick({
  flatUp,
  marked,
  throwId,
  toss = { x: 0, tilt: 0 },
  size = "md",
  delayIndex = 0,
}: {
  flatUp: boolean;
  marked?: boolean;
  /** Bumping this re-mounts the stick and re-runs the toss animation. */
  throwId?: number;
  toss?: Toss;
  size?: "sm" | "md";
  delayIndex?: number;
}) {
  const dimensions =
    size === "sm" ? "w-4 h-12 sm:w-5 sm:h-14" : "w-7 h-24 sm:w-8 sm:h-28";

  const isThrow = throwId !== undefined;

  return (
    <motion.div
      key={throwId}
      className={`relative ${dimensions} shrink-0`}
      style={{
        transformStyle: "preserve-3d",
        perspective: 360,
        willChange: "transform",
      }}
      initial={
        isThrow
          ? { y: 0, x: 0, rotate: 0, rotateX: flatUp ? 0 : 180 }
          : { rotateX: flatUp ? 0 : 180 }
      }
      animate={
        isThrow
          ? {
              // Up, peak hold, fall — arc.
              y: [0, -220, -200, 0],
              // Drift sideways, mostly during the fall.
              x: [0, 0, toss.x * 0.45, toss.x],
              // Tumble around z and settle at small tilt.
              rotate: [0, 540, 900, 1080 + toss.tilt],
              // 3 full face flips ending on the chosen side.
              rotateX: flatUp ? 1080 : 1260,
            }
          : { rotateX: flatUp ? 0 : 180 }
      }
      transition={
        isThrow
          ? {
              duration: 1.3,
              delay: delayIndex * 0.03,
              y: {
                times: [0, 0.32, 0.5, 1],
                ease: ["easeOut", "linear", "easeIn"],
              },
              x: {
                times: [0, 0.32, 0.5, 1],
                ease: ["linear", "linear", "easeOut"],
              },
              rotate: {
                times: [0, 0.32, 0.5, 1],
                ease: ["easeOut", "linear", "easeOut"],
              },
              rotateX: { ease: "easeOut" },
            }
          : { duration: 0.3 }
      }
    >
      {/* Flat face — visible at rotateX = 0 */}
      <div
        className="absolute inset-0 rounded-md bg-gradient-to-b from-amber-100 to-amber-200 ring-1 ring-amber-900/20 shadow-md"
        style={{ backfaceVisibility: "hidden" }}
      >
        <div className="absolute inset-x-1 top-1 bottom-1 rounded-sm border border-amber-700/15" />
        {marked && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-2 rounded-full bg-rose-500 ring-2 ring-rose-100" />
        )}
      </div>

      {/* Round face — visible at rotateX = 180 */}
      <div
        className="absolute inset-0 rounded-md bg-gradient-to-r from-amber-900 via-amber-700 to-amber-900 ring-1 ring-amber-950/30 shadow-md"
        style={{
          backfaceVisibility: "hidden",
          transform: "rotateX(180deg)",
        }}
      >
        <div className="absolute inset-y-2 left-1/2 -translate-x-1/2 w-px bg-amber-950/50" />
      </div>
    </motion.div>
  );
}
