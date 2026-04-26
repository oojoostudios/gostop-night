import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { SectionPlaceholder } from "@/components/section-placeholder";
import { SectionYutBoard } from "@/components/section-yut-board";
import { SectionYutFlow } from "@/components/section-yut-flow";
import { SectionYutSticks } from "@/components/section-yut-sticks";
import { SectionYutStrategy } from "@/components/section-yut-strategy";
import { SectionYutWinning } from "@/components/section-yut-winning";
import { SiteFooter } from "@/components/site-footer";
import { SECTIONS_BY_GAME } from "@/lib/sections";

export const metadata: Metadata = {
  title: "Yutnori · A Visual Guide to Korean Games",
  description:
    "Learn how to play 윷놀이 (Yutnori) — the Korean board game families play during Lunar New Year.",
};

const IMPLEMENTED = new Set([
  "yut-sticks",
  "yut-board",
  "yut-flow",
  "yut-strategy",
  "yut-winning",
]);

export default function YutnoriPage() {
  const sections = SECTIONS_BY_GAME.yutnori;
  return (
    <>
      <Hero
        titleKo="윷놀이"
        titleEn="Yutnori"
        blurbKo="설날에 가족들이 둘러앉아 던지는 윷. 한국 고유의 4-막대 보드 게임이에요."
        blurbEn="The Korean board game families play during Lunar New Year — a four-stick race around a cross-shaped board."
      />
      <SectionYutSticks />
      <SectionYutBoard />
      <SectionYutFlow />
      <SectionYutStrategy />
      <SectionYutWinning />
      {sections
        .filter((s) => !IMPLEMENTED.has(s.id))
        .map((section) => (
          <SectionPlaceholder key={section.id} section={section} />
        ))}
      <SiteFooter />
    </>
  );
}
