'use client';

import { motion } from 'motion/react';
import { useLocale } from '@/contexts/locale-context';

const EASE = [0.32, 0.72, 0, 1] as const;

export function EtymologyBand() {
  const { locale } = useLocale();

  return (
    <section className="relative border-y border-hairline bg-surface">
      <div className="lg:ml-72">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-16 py-10 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: EASE }}
            className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-12 items-start"
          >
            {/* Etymology chain — visual hook */}
            <div className="flex items-baseline gap-3 font-display text-2xl sm:text-3xl whitespace-nowrap">
              <span className="text-ink">carta</span>
              <span className="font-sans text-ink-soft text-base">→</span>
              <span className="text-ink">花札</span>
              <span className="font-sans text-ink-soft text-base">→</span>
              <span className="text-plum">화투</span>
            </div>

            {/* Origin note */}
            <div className="max-w-2xl">
              <div className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-2">
                {locale === 'ko' ? '화투의 유래' : 'Origin'}
              </div>
              <p className="text-sm sm:text-base text-ink leading-relaxed">
                {locale === 'ko' ? (
                  <>
                    16세기 후반 포르투갈 선교사들이 일본에 전한{' '}
                    <em className="font-medium text-ink">카루타(carta)</em>
                    가 에도 막부의 도박 금지령을 피해{' '}
                    <em className="font-medium text-ink">하나후다(花札)</em>
                    라는 꽃 그림 카드로 변형됐고, 19세기 말 대마도 상인들을 통해 한국으로 유입된
                    것으로 전해집니다.
                  </>
                ) : (
                  <>
                    In the late 16th century, Portuguese missionaries brought playing cards called{' '}
                    <em className="font-medium text-ink">carta</em>
                    {/* Space kept inside a string literal: a bare JSX space here gets collapsed
                     * by the formatter and then dropped by the server renderer, which desyncs
                     * SSR from hydration. */}
                    {' to Japan. '}
                    To skirt the Edo shogunate&apos;s gambling bans, they mutated into floral
                    picture cards called <em className="font-medium text-ink">hanafuda (花札)</em>,
                    and entered Korea via Tsushima merchants in the late 19th century — eventually
                    becoming <em className="font-medium text-ink">hwatu (화투)</em>.
                  </>
                )}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
