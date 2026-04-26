'use client';

import type { ReactNode } from 'react';
import { motion } from 'motion/react';

const EASE = [0.16, 1, 0.3, 1] as const;

export function FadeInOnView({
  children,
  delay = 0,
  y = 8,
  duration = 0.4,
  className,
  as = 'div',
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
  as?: 'div' | 'section' | 'h2' | 'h3' | 'p' | 'li';
}) {
  const Component = motion[as];
  return (
    <Component
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration, ease: EASE, delay }}
      className={className}
    >
      {children}
    </Component>
  );
}
