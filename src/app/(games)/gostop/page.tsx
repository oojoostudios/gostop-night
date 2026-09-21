import type { Metadata } from 'next';
import { Hero } from '@/components/hero';
import { EtymologyBand } from '@/components/etymology-band';
import { SectionCards } from '@/components/section-cards';
import { SectionDeal } from '@/components/section-deal';
import { SectionFlow } from '@/components/section-flow';
import { SectionGoStop } from '@/components/section-gostop';
import { SectionScoring } from '@/components/section-scoring';
import { SectionSpecial } from '@/components/section-special';
import { SectionTonight } from '@/components/section-tonight';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'Go-Stop rules · 고스톱 룰',
  description:
    'Learn how to play 고스톱 (Go-Stop) — the Korean card game families gather around — in five minutes. 명절마다 온 가족이 둘러앉아 치는 고스톱, 5분이면 룰을 익혀요.',
};

export default function GoStopPage() {
  return (
    <>
      <Hero
        titleKo="고스톱"
        titleEn="Go-Stop"
        blurbKo="한국 사람들이 명절마다 화투로 치는 고스톱. 5분만에 룰을 익혀보세요."
        blurbEn="The Korean card game families gather around during holidays. Learn the rules in five minutes."
      />
      <EtymologyBand />
      <SectionCards />
      <SectionDeal />
      <SectionFlow />
      <SectionScoring />
      <SectionSpecial />
      <SectionGoStop />
      <SectionTonight />
      <SiteFooter />
    </>
  );
}
