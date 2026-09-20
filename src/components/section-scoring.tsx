'use client';

import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { useLocale } from '@/contexts/locale-context';
import { ScoreCalculator } from '@/components/score-calculator';
import { WinningPatterns } from '@/components/winning-patterns';
import { FadeInOnView } from '@/components/fade-in-on-view';
import { HwatuCardImage } from '@/components/hwatu-card-image';
import { HWATU_DECK, HWATU_TYPES, type HwatuType } from '@/lib/hwatu';

const EASE = [0.16, 1, 0.3, 1] as const;

const TYPE_BADGE: Record<HwatuType, string> = {
  gwang: 'bg-amber-500 text-white',
  tti: 'bg-rose-500 text-white',
  kkeut: 'bg-emerald-600 text-white',
  pi: 'bg-zinc-600 text-white',
};

// Combos
const HONGDAN = ['01-tti', '02-tti', '03-tti']; // 1 + 2 + 3월
const CHEONGDAN = ['06-tti', '09-tti', '10-tti']; // 6 + 9 + 10월
const CHODAN = ['04-tti', '05-tti', '07-tti']; // 4 + 5 + 7월
const GODORI = ['02-kkeut', '04-kkeut', '08-kkeut']; // 꾀꼬리 + 두견새 + 기러기

const cardById = (id: string) => HWATU_DECK.find((c) => c.id === id);

export function SectionScoring() {
  const { locale } = useLocale();

  return (
    <section
      id="section-scoring"
      className="relative py-24 border-t border-foreground/10 section-scoring-bg"
    >
      <div className="lg:ml-72">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-16">
          <FadeInOnView className="text-xs tabular-nums text-foreground/50 mb-4">
            SECTION 04
          </FadeInOnView>
          <FadeInOnView
            as="h2"
            delay={0.05}
            className="text-4xl md:text-5xl font-semibold tracking-tight mb-6"
          >
            {locale === 'ko' ? '점수 계산' : 'Scoring'}
          </FadeInOnView>
          <FadeInOnView
            as="p"
            delay={0.12}
            className="text-lg text-foreground/60 max-w-2xl leading-relaxed mb-14"
          >
            {locale === 'ko'
              ? '광·띠·열·피 — 카드 종류마다 점수 계산이 달라요. 같은 색 띠 3장 같은 콤보가 추가 점수를 만들어요.'
              : 'Brights, ribbons, animals, junk — each type scores differently. Special combos (three-of-a-color, three songbirds) earn bonus points.'}
          </FadeInOnView>

          <div className="space-y-16">
            <FadeInOnView>
              <GwangBlock />
            </FadeInOnView>
            <FadeInOnView>
              <TtiBlock />
            </FadeInOnView>
            <FadeInOnView>
              <KkeutBlock />
            </FadeInOnView>
            <FadeInOnView>
              <PiBlock />
            </FadeInOnView>
          </div>

          <div className="border-t border-foreground/10 pt-14 mt-16">
            <WinningPatterns />
          </div>

          <ScoreCalculator />
        </div>
      </div>
    </section>
  );
}

function CategoryHeader({ type }: { type: HwatuType }) {
  const { locale } = useLocale();
  const meta = HWATU_TYPES[type];
  return (
    <div className="flex items-center gap-3 mb-3">
      <span
        className={`text-[10px] px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider ${TYPE_BADGE[type]}`}
      >
        {locale === 'ko' ? meta.labelKo : meta.label}
      </span>
      <h3 className="text-2xl font-semibold tracking-tight">
        {locale === 'ko'
          ? type === 'gwang'
            ? '광'
            : type === 'tti'
              ? '띠'
              : type === 'kkeut'
                ? '열'
                : '피'
          : type === 'gwang'
            ? 'Brights'
            : type === 'tti'
              ? 'Ribbons'
              : type === 'kkeut'
                ? 'Animals'
                : 'Junk'}
      </h3>
    </div>
  );
}

function MiniCard({
  id,
  highlighted,
  ringColor = 'outline-amber-500',
}: {
  id: string;
  highlighted?: boolean;
  ringColor?: string;
}) {
  const card = cardById(id);
  if (!card) return null;
  return (
    <div
      className={`relative aspect-[2/3] w-14 sm:w-16 rounded-md overflow-hidden ring-1 ring-black/10 bg-white ${
        highlighted ? `outline outline-2 outline-offset-2 ${ringColor}` : ''
      }`}
    >
      <HwatuCardImage card={card} className="absolute inset-0 w-full h-full" />
    </div>
  );
}

function ScoreCell({
  label,
  score,
  detail,
  emphasis,
  delay = 0,
}: {
  label: string;
  score: string;
  detail?: string;
  emphasis?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.36, ease: EASE, delay }}
      className={`relative rounded-md border px-3 py-2.5 ${
        emphasis ? 'border-amber-500 bg-amber-500/5 score-cell-emphasis' : 'border-foreground/15'
      }`}
    >
      <div className="text-[11px] uppercase tracking-wider font-semibold text-foreground/60">
        {label}
      </div>
      <div className="text-lg font-semibold tabular-nums mt-0.5">{score}</div>
      {detail && (
        <div className="text-[10px] text-foreground/50 leading-tight mt-0.5">{detail}</div>
      )}
    </motion.div>
  );
}

function ComboCallout({
  title,
  score,
  desc,
  cardIds,
  ringColor,
  borderClass,
}: {
  title: string;
  score: string;
  desc: string;
  cardIds: ReadonlyArray<string>;
  ringColor: string;
  borderClass: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: EASE }}
      whileHover="lift"
      className={`group rounded-lg border ${borderClass} p-4 transition-shadow hover:shadow-md`}
    >
      <div className="flex items-baseline gap-2 mb-2">
        <span className="font-semibold">{title}</span>
        <motion.span
          variants={{ lift: { scale: 1.08 } }}
          transition={{ type: 'spring', stiffness: 360, damping: 22 }}
          className="text-sm font-semibold tabular-nums text-foreground/70 inline-block origin-left"
        >
          {score}
        </motion.span>
      </div>
      <p className="text-sm text-foreground/70 leading-relaxed mb-3">{desc}</p>
      <div className="flex gap-2">
        {cardIds.map((id, i) => (
          <motion.div
            key={id}
            variants={{ lift: { y: -4 } }}
            transition={{
              type: 'spring',
              stiffness: 320,
              damping: 22,
              delay: i * 0.04,
            }}
          >
            <MiniCard id={id} highlighted ringColor={ringColor} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function GwangBlock() {
  const { locale } = useLocale();
  const gwangs = HWATU_DECK.filter((c) => c.type === 'gwang');
  const biggang = '12-gwang';

  return (
    <div>
      <CategoryHeader type="gwang" />
      <p className="text-sm text-foreground/65 max-w-2xl leading-relaxed mb-5">
        {locale === 'ko'
          ? '광은 다섯 장. 3장부터 점수가 들어와요. 하지만 12월 비광은 차감 효과가 있어서 비광 포함 3광은 2점.'
          : "There are five brights. Three or more begin to score — but the December Rain bright (비광 · Bigwang) discounts the score by one when it's part of the count."}
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-w-xl mb-6">
        <ScoreCell
          label={locale === 'ko' ? '3광 (비광 X)' : '3 brights (no rain)'}
          score={locale === 'ko' ? '3점' : '3 pts'}
          delay={0}
        />
        <ScoreCell
          label={locale === 'ko' ? '3광 (비광 O)' : '3 brights (w/ rain)'}
          score={locale === 'ko' ? '2점' : '2 pts'}
          detail={locale === 'ko' ? '비광 차감' : 'rain penalty'}
          delay={0.06}
        />
        <ScoreCell
          label={locale === 'ko' ? '4광' : '4 brights'}
          score={locale === 'ko' ? '4점' : '4 pts'}
          delay={0.12}
        />
        <ScoreCell
          label={locale === 'ko' ? '5광' : '5 brights'}
          score={locale === 'ko' ? '15점' : '15 pts'}
          detail={locale === 'ko' ? '최고 점수' : 'max'}
          emphasis
          delay={0.18}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {gwangs.map((g, i) => (
          <motion.div
            key={g.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, ease: EASE, delay: i * 0.05 }}
            whileHover={{ y: -3 }}
            className="flex flex-col items-center gap-1.5"
          >
            <MiniCard id={g.id} highlighted={g.id === biggang} ringColor="outline-rose-500" />
            <div className="text-[10px] text-foreground/60 tabular-nums">
              {g.month}월
              {g.id === biggang && (
                <span className="ml-1 text-rose-600 font-semibold">
                  {locale === 'ko' ? '비광' : 'Rain'}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TtiBlock() {
  const { locale } = useLocale();

  return (
    <div>
      <CategoryHeader type="tti" />
      <p className="text-sm text-foreground/65 max-w-2xl leading-relaxed mb-5">
        {locale === 'ko'
          ? '띠 5장이면 1점, 한 장 추가될 때마다 +1점. 추가로 같은 색 띠 3장이 모이면 콤보 점수가 따로 들어와요.'
          : 'Five ribbons score 1 point, +1 per extra. Three of the same color form a separate combo bonus.'}
      </p>

      <div className="space-y-3">
        <ComboCallout
          title={locale === 'ko' ? '홍단 (1·2·3월)' : 'Hongdan · Red ribbons'}
          score={locale === 'ko' ? '+3점' : '+3 pts'}
          desc={
            locale === 'ko'
              ? '1월·2월·3월의 빨간 띠 (시문이 적힌 홍색 띠)'
              : 'Red ribbons of January, February, March — poetry-inscribed.'
          }
          cardIds={HONGDAN}
          ringColor="outline-rose-500"
          borderClass="border-rose-300 bg-rose-500/5"
        />
        <ComboCallout
          title={locale === 'ko' ? '청단 (6·9·10월)' : 'Cheongdan · Blue ribbons'}
          score={locale === 'ko' ? '+3점' : '+3 pts'}
          desc={
            locale === 'ko' ? '6월·9월·10월의 파란 띠' : 'Blue ribbons of June, September, October.'
          }
          cardIds={CHEONGDAN}
          ringColor="outline-blue-500"
          borderClass="border-blue-300 bg-blue-500/5"
        />
        <ComboCallout
          title={locale === 'ko' ? '초단 (4·5·7월)' : 'Chodan · Grass ribbons'}
          score={locale === 'ko' ? '+3점' : '+3 pts'}
          desc={
            locale === 'ko' ? '4월·5월·7월의 초록 띠' : 'Grass-colored ribbons of April, May, July.'
          }
          cardIds={CHODAN}
          ringColor="outline-green-600"
          borderClass="border-green-300 bg-green-500/5"
        />
      </div>

      <p className="text-xs text-foreground/50 mt-4 italic">
        {locale === 'ko'
          ? '* 12월 띠는 콤보에 들어가지 않아요. 띠 카운트엔 포함.'
          : "* The December ribbon doesn't count toward any combo, but does add to total ribbon count."}
      </p>
    </div>
  );
}

function KkeutBlock() {
  const { locale } = useLocale();
  const kkeuts = HWATU_DECK.filter((c) => c.type === 'kkeut');

  return (
    <div>
      <CategoryHeader type="kkeut" />
      <p className="text-sm text-foreground/65 max-w-2xl leading-relaxed mb-5">
        {locale === 'ko'
          ? '열 5장이면 1점, 한 장 추가될 때마다 +1점. 새 3마리를 모으면 고도리 콤보.'
          : 'Five animals score 1 point, +1 per extra. Collecting all three songbirds forms godori — a separate combo.'}
      </p>

      <ComboCallout
        title={locale === 'ko' ? '고도리' : 'Godori · Songbird trio'}
        score={locale === 'ko' ? '+5점' : '+5 pts'}
        desc={
          locale === 'ko'
            ? '새가 그려진 열 3장 — 꾀꼬리(2월) + 두견새(4월) + 기러기(8월)'
            : 'Three bird animals — warbler (February), cuckoo (April), geese (August).'
        }
        cardIds={GODORI}
        ringColor="outline-emerald-500"
        borderClass="border-emerald-300 bg-emerald-500/5"
      />

      <div className="text-[11px] uppercase tracking-[0.18em] text-foreground/50 mt-6 mb-2 font-semibold">
        {locale === 'ko' ? '전체 열 (9장)' : 'All animals (9)'}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {kkeuts.map((k, i) => (
          <motion.div
            key={k.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.32, ease: EASE, delay: i * 0.04 }}
          >
            <MiniCard
              id={k.id}
              highlighted={GODORI.includes(k.id)}
              ringColor="outline-emerald-500"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PiBlock() {
  const { locale } = useLocale();
  const pis = HWATU_DECK.filter((c) => c.type === 'pi');
  const ssangPi = pis.filter((p) => p.tag === '쌍피');
  const regularPi = pis.filter((p) => p.tag !== '쌍피');

  return (
    <div>
      <CategoryHeader type="pi" />
      <p className="text-sm text-foreground/65 max-w-2xl leading-relaxed mb-5">
        {locale === 'ko'
          ? '피 10장이면 1점, 한 장 추가될 때마다 +1점. 쌍피는 한 장이 두 장의 효과를 가져요.'
          : 'Ten junk score 1 point, +1 per extra. Double junk (쌍피) count as two each.'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">
        <Block label={locale === 'ko' ? '일반 피' : 'Regular junk'} count={regularPi.length}>
          <div className="flex flex-wrap gap-1.5">
            {regularPi.slice(0, 8).map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.3, ease: EASE, delay: i * 0.03 }}
              >
                <MiniCard id={p.id} />
              </motion.div>
            ))}
            {regularPi.length > 8 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.3, ease: EASE, delay: 8 * 0.03 }}
                className="aspect-[2/3] w-14 sm:w-16 rounded-md bg-foreground/5 ring-1 ring-foreground/10 flex items-center justify-center text-[11px] text-foreground/50 tabular-nums"
              >
                +{regularPi.length - 8}
              </motion.div>
            )}
          </div>
        </Block>

        <Block
          label={locale === 'ko' ? '쌍피 (×2)' : 'Double junk (×2)'}
          count={ssangPi.length}
          accent="purple"
        >
          <div className="flex gap-1.5">
            {ssangPi.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 22,
                  delay: i * 0.08,
                }}
                whileHover={{ y: -3, scale: 1.04 }}
                className="relative"
              >
                <MiniCard id={p.id} highlighted ringColor="outline-purple-500" />
                <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-purple-600 text-white px-1 rounded-full leading-none py-0.5">
                  ×2
                </span>
              </motion.div>
            ))}
          </div>
        </Block>
      </div>

      <p className="text-xs text-foreground/50 mt-4 italic">
        {locale === 'ko'
          ? '* 보너스피(맞고 룰)는 같은 방식으로 ×2.'
          : '* Bonus pi (matgo only) similarly counts as 2.'}
      </p>
    </div>
  );
}

function Block({
  label,
  count,
  accent,
  children,
}: {
  label: string;
  count: number;
  accent?: 'purple';
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <span
          className={`text-[11px] uppercase tracking-[0.18em] font-semibold ${
            accent === 'purple' ? 'text-purple-600 dark:text-purple-400' : 'text-foreground/60'
          }`}
        >
          {label}
        </span>
        <span className="text-[11px] text-foreground/40 tabular-nums">({count})</span>
      </div>
      {children}
    </div>
  );
}
