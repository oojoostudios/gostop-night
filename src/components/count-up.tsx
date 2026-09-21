'use client';

import { useEffect } from 'react';
import {
  animate,
  motion,
  useAnimate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react';

/**
 * A number that rolls from its old value to its new one (~0.6s, ease-out), with a brief tint behind it:
 * sage when it goes up, plum when it goes down. With reduced motion, it just changes.
 * Sage and plum are fills here, never text color.
 */
export function CountUp({
  value,
  decimals = 0,
  prefix = '',
  signed = false,
  className = '',
}: {
  value: number;
  decimals?: number;
  /** Put in front of the digits, after any sign: "$" gives "−$3.00". */
  prefix?: string;
  /** Show "+" for gains and "−" for losses. */
  signed?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const [scope, animateScope] = useAnimate<HTMLSpanElement>();

  const text = useTransform(mv, (v) => {
    const shown = Number(v.toFixed(decimals));
    const sign = shown < 0 ? '−' : signed && shown > 0 ? '+' : '';
    return `${sign}${prefix}${Math.abs(shown).toFixed(decimals)}`;
  });

  useEffect(() => {
    const from = mv.get();
    if (from === value) return;
    if (reduce) {
      mv.jump(value);
      return;
    }
    const tint = scope.current?.querySelector<HTMLElement>('[data-tint]');
    if (tint) {
      tint.dataset.dir = value > from ? 'gain' : 'loss';
      animateScope(tint, { opacity: [1, 0] }, { duration: 0.6, ease: 'easeOut' });
    }
    const roll = animate(mv, value, { duration: 0.6, ease: 'easeOut' });
    return () => roll.stop();
  }, [value, reduce, mv, scope, animateScope]);

  return (
    <span ref={scope} className={`relative inline-block tabular-nums ${className}`}>
      <span
        data-tint
        aria-hidden
        className="pointer-events-none absolute -inset-x-1.5 inset-y-0 rounded-md opacity-0 data-[dir=gain]:bg-sage/35 data-[dir=loss]:bg-plum/20"
      />
      <motion.span className="relative">{text}</motion.span>
    </span>
  );
}
