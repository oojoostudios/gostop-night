import { Hero } from '@/components/hero';
import { SectionCards } from '@/components/section-cards';
import { SectionDeal } from '@/components/section-deal';
import { SectionFlow } from '@/components/section-flow';
import { SectionGoStop } from '@/components/section-gostop';
import { SectionScoring } from '@/components/section-scoring';
import { SectionSpecial } from '@/components/section-special';
import { SectionTonight } from '@/components/section-tonight';
import { SiteFooter } from '@/components/site-footer';

// No page-level metadata override here — the root layout's GoStop Club title and
// description (src/app/layout.tsx) apply.

export default function GoStopPage() {
  return (
    <>
      <Hero />
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
