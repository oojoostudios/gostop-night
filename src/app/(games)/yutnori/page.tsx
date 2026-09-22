import type { Metadata } from 'next';
import { Hero } from '@/components/hero';
import { SectionPlaceholder } from '@/components/section-placeholder';
import { SectionYutBoard } from '@/components/section-yut-board';
import { SectionYutFlow } from '@/components/section-yut-flow';
import { SectionYutSticks } from '@/components/section-yut-sticks';
import { SectionYutStrategy } from '@/components/section-yut-strategy';
import { SectionYutWinning } from '@/components/section-yut-winning';
import { SiteFooter } from '@/components/site-footer';
import { SECTIONS_BY_GAME } from '@/lib/sections';

export const metadata: Metadata = {
  title: 'Yutnori rules · 윷놀이 룰',
  description:
    'Learn how to play 윷놀이 (Yutnori) — the Korean board game families play during Lunar New Year.',
};

const IMPLEMENTED = new Set(['yut-sticks', 'yut-board', 'yut-flow', 'yut-strategy', 'yut-winning']);

export default function YutnoriPage() {
  const sections = SECTIONS_BY_GAME.yutnori;
  return (
    <>
      <Hero />
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
