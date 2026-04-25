import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { SectionCards } from "@/components/section-cards";
import { SectionFlow } from "@/components/section-flow";
import { SectionGoStop } from "@/components/section-gostop";
import { SectionScoring } from "@/components/section-scoring";
import { SectionSpecial } from "@/components/section-special";

export const metadata: Metadata = {
  title: "Go-Stop · A Visual Guide to Korean Games",
  description:
    "Learn how to play 고스톱 (Go-Stop) — the Korean card game families gather around — in five minutes.",
};

export default function GoStopPage() {
  return (
    <>
      <Hero
        titleKo="고스톱"
        titleEn="Go-Stop"
        blurbKo="한국 사람들이 명절마다 둘러앉아 치는 화투 게임. 5분만에 룰을 익혀보세요."
        blurbEn="The Korean card game families gather around during holidays. Learn the rules in five minutes."
      />
      <SectionCards />
      <SectionFlow />
      <SectionScoring />
      <SectionSpecial />
      <SectionGoStop />
    </>
  );
}
