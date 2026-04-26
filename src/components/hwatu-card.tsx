"use client";

import { motion } from "motion/react";
import { useLocale } from "@/contexts/locale-context";
import { HwatuCardImage } from "@/components/hwatu-card-image";
import { HWATU_TYPES, type HwatuCard as HwatuCardData } from "@/lib/hwatu";

export function HwatuCard({
  card,
  isActive,
  onSelect,
}: {
  card: HwatuCardData;
  isActive?: boolean;
  onSelect?: (card: HwatuCardData) => void;
}) {
  const { locale } = useLocale();
  const typeMeta = HWATU_TYPES[card.type];

  return (
    <motion.button
      type="button"
      onClick={() => onSelect?.(card)}
      whileHover={{ y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.94, y: -2 }}
      transition={{ type: "spring", stiffness: 600, damping: 22, mass: 0.5 }}
      aria-label={`${card.month}월 ${locale === "ko" ? typeMeta.labelKo : typeMeta.label}`}
      className={`relative w-full aspect-[2/3] rounded-md overflow-hidden bg-white shadow-sm ring-1 ring-black/10 transition-shadow hover:shadow-md ${
        isActive ? "outline outline-2 outline-offset-2 outline-foreground" : ""
      }`}
    >
      <HwatuCardImage
        card={card}
        className="absolute inset-0 w-full h-full"
      />
    </motion.button>
  );
}
