'use client';

import { motion } from 'motion/react';
import { HwatuCardImage } from '@/components/hwatu-card-image';
import { cardLabel, type HwatuCard as HwatuCardData } from '@/lib/hwatu';

export function HwatuCard({
  card,
  onSelect,
}: {
  card: HwatuCardData;
  /** Kept so callers can still pass it; a parent that wants to dim other cards does so itself. */
  isActive?: boolean;
  onSelect?: (card: HwatuCardData) => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect?.(card)}
      whileHover={{ y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.94, y: -2 }}
      transition={{ type: 'spring', stiffness: 600, damping: 22, mass: 0.5 }}
      aria-label={cardLabel(card)}
      className="relative w-full aspect-[2/3]"
    >
      <HwatuCardImage card={card} className="absolute inset-0 w-full h-full" />
    </motion.button>
  );
}
