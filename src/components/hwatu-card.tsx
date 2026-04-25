"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useLocale } from "@/contexts/locale-context";
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
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      aria-label={`${card.month}월 ${locale === "ko" ? typeMeta.labelKo : typeMeta.label}`}
      className={`relative aspect-[2/3] rounded-md overflow-hidden bg-white shadow-sm ring-1 ring-black/10 ${
        isActive ? "outline outline-2 outline-offset-2 outline-foreground" : ""
      }`}
    >
      <Image
        src={card.image}
        alt={locale === "ko" ? card.nameKo : card.name}
        fill
        sizes="(max-width: 1024px) 25vw, 150px"
        className="object-cover"
      />
    </motion.button>
  );
}
