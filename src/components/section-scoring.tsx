'use client';

import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { useLocale } from '@/contexts/locale-context';
import { ScoreCalculator } from '@/components/score-calculator';
import { FadeInOnView } from '@/components/fade-in-on-view';
import { HwatuCardImage } from '@/components/hwatu-card-image';
import { HWATU_DECK, HWATU_TYPES, type HwatuType } from '@/lib/hwatu';
import { SCORING } from '@/config/rules';

const EASE = [0.16, 1, 0.3, 1] as const;

// Card-type dot colors (globals.css): each gets a 1px ink ring via `.type-dot`.
const TYPE_DOT: Record<HwatuType, string> = {
  gwang: 'type-dot bg-type-bright',
  tti: 'type-dot bg-type-ribbon',
  kkeut: 'type-dot bg-type-animal',
  pi: 'type-dot bg-type-junk',
};

// Combos
const HONGDAN = ['01-tti', '02-tti', '03-tti']; // 1 + 2 + 3월
const CHEONGDAN = ['06-tti', '09-tti', '10-tti']; // 6 + 9 + 10월
const CHODAN = ['04-tti', '05-tti', '07-tti']; // 4 + 5 + 7월
/** 5 -> "Five", 10 -> "Ten" (other numbers stay as digits). */
const numberWord = (n: number) => ({ 5: 'Five', 10: 'Ten' })[n] ?? String(n);

const GODORI = ['02-kkeut', '04-kkeut', '08-kkeut']; // 꾀꼬리 + 두견새 + 기러기

const cardById = (id: string) => HWATU_DECK.find((c) => c.id === id);

export function SectionScoring() {
  const { locale } = useLocale();

  return (
    <section
      id="section-scoring"
      className="relative py-24 border-t border-hairline section-scoring-bg"
    >
      <div className="lg:ml-72">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-16">
          <FadeInOnView
            as="h2"
            delay={0.05}
            className="font-display text-4xl md:text-5xl leading-tight mb-6"
          >
            <span className="text-plum">04</span>
            <span className="ml-4">{locale === 'ko' ? '점수 계산' : 'Scoring'}</span>
          </FadeInOnView>
          <FadeInOnView
            as="p"
            delay={0.12}
            className="text-lg text-ink-soft max-w-2xl leading-relaxed mb-14"
          >
            {locale === 'ko'
              ? '광·띠·열·피 — 카드 종류마다 점수 계산이 달라요. 같은 색 띠 3장 같은 콤보가 추가 점수를 만들어요.'
              : 'Brights, ribbons, animals, junk — each type scores differently. Special combos (three-of-a-color, three songbirds) earn bonus points.'}
          </FadeInOnView>

          <FadeInOnView className="mb-16">
            <ScoringSummary />
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

          <ScoreCalculator />
        </div>
      </div>
    </section>
  );
}

type SummaryRow = {
  dot: string;
  labelKo: string;
  labelEn: string;
  scoreKo: string;
  scoreEn: string;
};

/** Every way to score, one row each, with its points — the same combos shown in the type blocks below. */
function ScoringSummary() {
  const { locale } = useLocale();
  const rows: SummaryRow[] = [
    {
      dot: TYPE_DOT.gwang,
      labelKo: '3광 (비광 X)',
      labelEn: '3 Brights (no rain)',
      scoreKo: `${SCORING.brights.three}점`,
      scoreEn: `${SCORING.brights.three} pts`,
    },
    {
      dot: TYPE_DOT.gwang,
      labelKo: '3광 (비광 O)',
      labelEn: '3 Brights (with rain)',
      scoreKo: `${SCORING.brights.threeWithRain}점`,
      scoreEn: `${SCORING.brights.threeWithRain} pts`,
    },
    {
      dot: TYPE_DOT.gwang,
      labelKo: '4광',
      labelEn: '4 Brights',
      scoreKo: `${SCORING.brights.four}점`,
      scoreEn: `${SCORING.brights.four} pts`,
    },
    {
      dot: TYPE_DOT.gwang,
      labelKo: '5광',
      labelEn: '5 Brights',
      scoreKo: `${SCORING.brights.five}점`,
      scoreEn: `${SCORING.brights.five} pts`,
    },
    {
      dot: TYPE_DOT.tti,
      labelKo: `띠 ${SCORING.ribbonsStartAt}장+`,
      labelEn: `Ribbons (${SCORING.ribbonsStartAt}+)`,
      scoreKo: '1점, +1/장',
      scoreEn: '1 pt, +1/extra',
    },
    {
      dot: TYPE_DOT.tti,
      labelKo: '홍단 (1·2·3월)',
      labelEn: 'Hongdan · Red ribbons',
      scoreKo: `+${SCORING.combos.hongdan}점`,
      scoreEn: `+${SCORING.combos.hongdan} pts`,
    },
    {
      dot: TYPE_DOT.tti,
      labelKo: '청단 (6·9·10월)',
      labelEn: 'Cheongdan · Blue ribbons',
      scoreKo: `+${SCORING.combos.cheongdan}점`,
      scoreEn: `+${SCORING.combos.cheongdan} pts`,
    },
    {
      dot: TYPE_DOT.tti,
      labelKo: '초단 (4·5·7월)',
      labelEn: 'Chodan · Grass ribbons',
      scoreKo: `+${SCORING.combos.chodan}점`,
      scoreEn: `+${SCORING.combos.chodan} pts`,
    },
    {
      dot: TYPE_DOT.kkeut,
      labelKo: `열 ${SCORING.animalsStartAt}장+`,
      labelEn: `Animals (${SCORING.animalsStartAt}+)`,
      scoreKo: '1점, +1/장',
      scoreEn: '1 pt, +1/extra',
    },
    {
      dot: TYPE_DOT.kkeut,
      labelKo: '고도리',
      labelEn: 'Godori · Songbird trio',
      scoreKo: `+${SCORING.combos.godori}점`,
      scoreEn: `+${SCORING.combos.godori} pts`,
    },
    {
      dot: TYPE_DOT.pi,
      labelKo: `피 ${SCORING.junkStartAt}장+`,
      labelEn: `Junk (${SCORING.junkStartAt}+)`,
      scoreKo: '1점, +1/장',
      scoreEn: '1 pt, +1/extra',
    },
  ];

  return (
    <div>
      <div className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-3">
        {locale === 'ko' ? '한눈에 보는 점수표' : 'Every way to score'}
      </div>
      <div className="club-card divide-y divide-hairline">
        {rows.map((row) => (
          <div key={row.labelEn} className="flex items-center justify-between gap-3 px-5 py-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${row.dot}`} />
              <span className="text-sm truncate">
                {locale === 'ko' ? row.labelKo : row.labelEn}
              </span>
            </div>
            <span className="text-sm font-bold tabular-nums shrink-0">
              {locale === 'ko' ? row.scoreKo : row.scoreEn}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryHeader({ type }: { type: HwatuType }) {
  const { locale } = useLocale();
  const meta = HWATU_TYPES[type];
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className={`size-3 rounded-full shrink-0 ${TYPE_DOT[type]}`} aria-hidden />
      <span className="text-xs uppercase tracking-wider font-semibold text-ink-soft">
        {locale === 'ko' ? meta.labelKo : meta.label}
      </span>
      <h3 className="font-display text-2xl">
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

function MiniCard({ id, dimmed }: { id: string; dimmed?: boolean }) {
  const card = cardById(id);
  if (!card) return null;
  return (
    <div
      className={`relative aspect-[2/3] w-14 sm:w-16 transition-opacity duration-200 ${
        dimmed ? 'opacity-40' : ''
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
      className={`club-card relative px-4 py-3 ${emphasis ? 'score-cell-emphasis' : ''}`}
    >
      <div className="text-xs uppercase tracking-wider font-semibold text-ink-soft">{label}</div>
      <div className="text-lg font-bold tabular-nums mt-1">{score}</div>
      {detail && <div className="text-xs text-ink-soft leading-tight mt-1">{detail}</div>}
    </motion.div>
  );
}

function ComboCallout({
  title,
  score,
  desc,
  cardIds,
  dotClass,
}: {
  title: string;
  score: string;
  desc: string;
  cardIds: ReadonlyArray<string>;
  dotClass: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: EASE }}
      whileHover="lift"
      className="group club-card p-5"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`size-3 rounded-full shrink-0 ${dotClass}`} aria-hidden />
        <span className="font-semibold">{title}</span>
        <motion.span
          variants={{ lift: { scale: 1.08 } }}
          transition={{ type: 'spring', stiffness: 360, damping: 22 }}
          className="text-sm font-bold tabular-nums text-ink-soft inline-block origin-left"
        >
          {score}
        </motion.span>
      </div>
      <p className="text-sm text-ink-soft leading-relaxed mb-3">{desc}</p>
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
            <MiniCard id={id} />
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
      <p className="text-sm text-ink-soft max-w-2xl leading-relaxed mb-5">
        {locale === 'ko'
          ? `광은 다섯 장. 3장부터 점수가 들어와요. 12월 비광이 끼면 3광은 ${SCORING.brights.three}점이 아니라 ${SCORING.brights.threeWithRain}점이고, 4광은 항상 ${SCORING.brights.four}점, 5광은 ${SCORING.brights.five}점이에요.`
          : `There are five brights. Three or more begin to score. With the December Rain bright (비광 · Bigwang), three brights are worth ${SCORING.brights.threeWithRain} instead of ${SCORING.brights.three}; four are always ${SCORING.brights.four}, and five are ${SCORING.brights.five}.`}
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-w-xl mb-6">
        <ScoreCell
          label={locale === 'ko' ? '3광 (비광 X)' : '3 brights (no rain)'}
          score={locale === 'ko' ? `${SCORING.brights.three}점` : `${SCORING.brights.three} pts`}
          delay={0}
        />
        <ScoreCell
          label={locale === 'ko' ? '3광 (비광 O)' : '3 brights (w/ rain)'}
          score={
            locale === 'ko'
              ? `${SCORING.brights.threeWithRain}점`
              : `${SCORING.brights.threeWithRain} pts`
          }
          detail={locale === 'ko' ? '비광 차감' : 'rain penalty'}
          delay={0.06}
        />
        <ScoreCell
          label={locale === 'ko' ? '4광' : '4 brights'}
          score={locale === 'ko' ? `${SCORING.brights.four}점` : `${SCORING.brights.four} pts`}
          delay={0.12}
        />
        <ScoreCell
          label={locale === 'ko' ? '5광' : '5 brights'}
          score={locale === 'ko' ? `${SCORING.brights.five}점` : `${SCORING.brights.five} pts`}
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
            <MiniCard id={g.id} />
            <div className="text-xs text-ink-soft tabular-nums">
              {g.month}월
              {g.id === biggang && (
                <span className="ml-1 text-ink font-bold">{locale === 'ko' ? '비광' : 'Rain'}</span>
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
      <p className="text-sm text-ink-soft max-w-2xl leading-relaxed mb-5">
        {locale === 'ko'
          ? `띠 ${SCORING.ribbonsStartAt}장이면 1점, 한 장 추가될 때마다 +1점. 추가로 같은 색 띠 3장이 모이면 콤보 점수가 따로 들어와요.`
          : `${numberWord(SCORING.ribbonsStartAt)} ribbons score 1 point, +1 per extra. Three of the same color form a separate combo bonus.`}
      </p>

      <div className="space-y-3">
        <ComboCallout
          title={locale === 'ko' ? '홍단 (1·2·3월)' : 'Hongdan · Red ribbons'}
          score={
            locale === 'ko' ? `+${SCORING.combos.hongdan}점` : `+${SCORING.combos.hongdan} pts`
          }
          desc={
            locale === 'ko'
              ? '1월·2월·3월의 빨간 띠 (시문이 적힌 홍색 띠)'
              : 'Red ribbons of January, February, March — poetry-inscribed.'
          }
          cardIds={HONGDAN}
          dotClass="bg-plum"
        />
        <ComboCallout
          title={locale === 'ko' ? '청단 (6·9·10월)' : 'Cheongdan · Blue ribbons'}
          score={
            locale === 'ko' ? `+${SCORING.combos.cheongdan}점` : `+${SCORING.combos.cheongdan} pts`
          }
          desc={
            locale === 'ko' ? '6월·9월·10월의 파란 띠' : 'Blue ribbons of June, September, October.'
          }
          cardIds={CHEONGDAN}
          dotClass="bg-sky"
        />
        <ComboCallout
          title={locale === 'ko' ? '초단 (4·5·7월)' : 'Chodan · Grass ribbons'}
          score={locale === 'ko' ? `+${SCORING.combos.chodan}점` : `+${SCORING.combos.chodan} pts`}
          desc={
            locale === 'ko' ? '4월·5월·7월의 초록 띠' : 'Grass-colored ribbons of April, May, July.'
          }
          cardIds={CHODAN}
          dotClass="bg-sage"
        />
      </div>

      <p className="text-xs text-ink-soft mt-4">
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
      <p className="text-sm text-ink-soft max-w-2xl leading-relaxed mb-5">
        {locale === 'ko'
          ? `열 ${SCORING.animalsStartAt}장이면 1점, 한 장 추가될 때마다 +1점. 새 3마리를 모으면 고도리 콤보.`
          : `${numberWord(SCORING.animalsStartAt)} animals score 1 point, +1 per extra. Collecting all three songbirds forms godori — a separate combo.`}
      </p>

      <ComboCallout
        title={locale === 'ko' ? '고도리' : 'Godori · Songbird trio'}
        score={locale === 'ko' ? `+${SCORING.combos.godori}점` : `+${SCORING.combos.godori} pts`}
        desc={
          locale === 'ko'
            ? '새가 그려진 열 3장 — 꾀꼬리(2월) + 두견새(4월) + 기러기(8월)'
            : 'Three bird animals — warbler (February), cuckoo (April), geese (August).'
        }
        cardIds={GODORI}
        dotClass="bg-ink"
      />

      <div className="text-xs uppercase tracking-[0.18em] text-ink-soft mt-6 mb-2 font-semibold">
        {locale === 'ko' ? '전체 열 (9장)' : 'All animals (9)'}
      </div>
      <p className="mt-3 max-w-2xl text-xs leading-relaxed text-ink-soft">
        {locale === 'ko'
          ? '9월 술잔(국진)은 열로도, 쌍피(피 2장)로도 셀 수 있어요. 점수를 셈할 때 직접 골라요.'
          : 'The September sake cup (국진) counts as an Animal or as 2 junk. You pick when you score.'}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {kkeuts.map((k, i) => (
          <motion.div
            key={k.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.32, ease: EASE, delay: i * 0.04 }}
          >
            <MiniCard id={k.id} dimmed={!GODORI.includes(k.id)} />
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
      <p className="text-sm text-ink-soft max-w-2xl leading-relaxed mb-5">
        {locale === 'ko'
          ? `피 ${SCORING.junkStartAt}장이면 1점, 한 장 추가될 때마다 +1점. 쌍피는 한 장이 두 장의 효과를 가져요.`
          : `${numberWord(SCORING.junkStartAt)} junk score 1 point, +1 per extra. Double junk (쌍피) count as two each.`}
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
                className="aspect-[2/3] w-14 sm:w-16 flex items-center justify-center text-xs text-ink-soft tabular-nums"
              >
                +{regularPi.length - 8}
              </motion.div>
            )}
          </div>
        </Block>

        <Block label={locale === 'ko' ? '쌍피 (×2)' : 'Double junk (×2)'} count={ssangPi.length}>
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
                <MiniCard id={p.id} />
                <span className="absolute -top-1 -right-1 text-xs font-bold bg-sage text-on-fill px-1.5 rounded-full leading-none py-0.5">
                  ×2
                </span>
              </motion.div>
            ))}
          </div>
        </Block>
      </div>
    </div>
  );
}

function Block({ label, count, children }: { label: string; count: number; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-xs uppercase tracking-[0.18em] font-semibold text-ink-soft">
          {label}
        </span>
        <span className="text-xs text-ink-soft tabular-nums">({count})</span>
      </div>
      {children}
    </div>
  );
}
