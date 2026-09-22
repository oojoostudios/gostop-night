'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Mascot } from '@/components/mascot';
import { WordmarkLogo } from '@/components/wordmark-logo';

const EASE = [0.32, 0.72, 0, 1] as const;

/**
 * Hero: just the wordmark logo and the mascot, stacked and centered. Nothing else —
 * no headline, tagline, stats, or fanned cards (see CLAUDE.md "Hero and navigation").
 * On a phone both fit in one screen without scrolling.
 */
export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-20">
      <div className="relative z-10 flex w-full flex-col items-center gap-10 lg:ml-72 sm:gap-12">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="w-[80%] max-w-xs sm:max-w-sm md:max-w-md"
        >
          <WordmarkLogo className="w-full" />
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.15, duration: 0.5, ease: EASE }}
          className="w-[45%] max-w-[240px]"
        >
          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
            transition={
              reduceMotion ? undefined : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            <Mascot className="w-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
