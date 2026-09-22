'use client';

import { Fragment, type ReactNode } from 'react';
import { useLocale } from '@/contexts/locale-context';
import { FadeInOnView } from '@/components/fade-in-on-view';
import { SectionTitle } from '@/components/section-title';
import { ScoreCardArt } from '@/components/score-card';
import { ScoreCalculator } from '@/components/score-calculator';
import { GOSTOP_SECTIONS } from '@/lib/sections';
import { HWATU_DECK, HWATU_TYPES, type HwatuCard, type HwatuType } from '@/lib/hwatu';
import { SCORING } from '@/config/rules';
import { HONGDAN_IDS, CHEONGDAN_IDS, CHODAN_IDS, GODORI_IDS } from '@/lib/score';

const SECTION = GOSTOP_SECTIONS.find((s) => s.id === 'section-scoring')!;

// Card-type dot colors (globals.css): each gets a 1px ink ring via `.type-dot`.
const TYPE_DOT: Record<HwatuType, string> = {
  gwang: 'type-dot bg-type-bright',
  tti: 'type-dot bg-type-ribbon',
  kkeut: 'type-dot bg-type-animal',
  pi: 'type-dot bg-type-junk',
};

const cardsOfType = (type: HwatuType): HwatuCard[] => HWATU_DECK.filter((c) => c.type === type);
const cardById = (id: string) => HWATU_DECK.find((c) => c.id === id);
const cardsById = (ids: ReadonlyArray<string>): HwatuCard[] =>
  ids.map(cardById).filter((c): c is HwatuCard => Boolean(c));

/**
 * Section 04 — Scoring. Matches assets-source/reference/scoring-preview.html:
 * the "Every way to score" summary table, four identical category blocks
 * (Brights, Ribbons, Animals, Junk), then the score calculator.
 */
export function SectionScoring() {
  const { locale } = useLocale();
  const ko = locale === 'ko';

  return (
    <section
      id="section-scoring"
      className="relative py-24 border-t border-hairline section-scoring-bg"
    >
      <div className="lg:ml-72">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-16">
          <SectionTitle section={SECTION} />
          <FadeInOnView
            as="p"
            delay={0.12}
            className="text-body text-ink-soft max-w-2xl leading-relaxed mb-14"
          >
            {ko
              ? '스톱을 부른 사람만 점수를 얻어요. 내가 가져온 카드를 기준으로, 아래 조건에 해당하는 항목을 모두 더해요.'
              : 'Only the player who calls Stop scores. Everything you captured is checked, and every line below that you meet adds together.'}
          </FadeInOnView>

          <FadeInOnView className="club-card p-5 sm:p-6 mb-16">
            <SubHeading en="Every way to score" ko="점수표" />
            <SummaryTable />
          </FadeInOnView>

          <div className="space-y-16">
            <FadeInOnView>
              <CategoryBlock type="gwang" />
            </FadeInOnView>
            <FadeInOnView>
              <CategoryBlock type="tti" />
            </FadeInOnView>
            <FadeInOnView>
              <CategoryBlock type="kkeut" />
            </FadeInOnView>
            <FadeInOnView>
              <CategoryBlock type="pi" />
            </FadeInOnView>
          </div>

          <ScoreCalculator />
        </div>
      </div>
    </section>
  );
}

/* An h3-level sub-heading: the current language, then the other language inline
 * (not stacked — that stacked treatment is reserved for the section's own h2). */
function SubHeading({ en, ko: koText }: { en: string; ko: string }) {
  const { locale } = useLocale();
  const [main, sub] = locale === 'ko' ? [koText, en] : [en, koText];
  return (
    <h3 className="font-display text-sub mb-3">
      {main}
      <span className="ml-2 font-display text-ink-soft">{sub}</span>
    </h3>
  );
}

/* -------------------------------------------------------------------------- */
/* "Every way to score" summary table                                         */
/* -------------------------------------------------------------------------- */

type SummaryRow = { en: string; ko: string; value: string };
type SummaryGroup = { type: HwatuType; rows: SummaryRow[] };

const SUMMARY: SummaryGroup[] = [
  {
    type: 'gwang',
    rows: [
      { en: '3 Brights', ko: '광 3장', value: String(SCORING.brights.three) },
      {
        en: '3 Brights, one of them the Dec rain Bright',
        ko: '광 3장 (12월 비광 포함)',
        value: String(SCORING.brights.threeWithRain),
      },
      { en: '4 Brights', ko: '광 4장', value: String(SCORING.brights.four) },
      { en: 'All 5 Brights', ko: '광 5장 전부', value: String(SCORING.brights.five) },
    ],
  },
  {
    type: 'tti',
    rows: [
      { en: 'Any 5 Ribbons', ko: '띠 5장', value: '1' },
      { en: 'Each extra Ribbon', ko: '추가 띠 1장마다', value: '+1' },
      {
        en: '홍단 Red set: Jan, Feb, Mar',
        ko: '홍단 · 1·2·3월',
        value: `+${SCORING.combos.hongdan}`,
      },
      {
        en: '청단 Blue set: Jun, Sep, Oct',
        ko: '청단 · 6·9·10월',
        value: `+${SCORING.combos.cheongdan}`,
      },
      {
        en: '초단 Grass set: Apr, May, Jul',
        ko: '초단 · 4·5·7월',
        value: `+${SCORING.combos.chodan}`,
      },
    ],
  },
  {
    type: 'kkeut',
    rows: [
      { en: 'Any 5 Animals', ko: '열 5장', value: '1' },
      { en: 'Each extra Animal', ko: '추가 열 1장마다', value: '+1' },
      {
        en: '고도리 Godori: Feb, Apr, Aug birds',
        ko: '고도리 · 2·4·8월 새',
        value: `+${SCORING.combos.godori}`,
      },
    ],
  },
  {
    type: 'pi',
    rows: [
      { en: 'Any 10 Junk (double junk counts as 2)', ko: '피 10장 (쌍피는 2장)', value: '1' },
      { en: 'Each extra Junk', ko: '추가 피 1장마다', value: '+1' },
    ],
  },
];

function SummaryTable() {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  return (
    <table className="w-full border-collapse">
      <tbody>
        {SUMMARY.map((group) => (
          <Fragment key={group.type}>
            <tr>
              <td colSpan={2} className="pt-5 pb-2 first:pt-0">
                <span
                  aria-hidden
                  className={`mr-2.5 inline-block size-3 rounded-full align-[-1px] ${TYPE_DOT[group.type]}`}
                />
                <span className="text-body font-bold">
                  {ko ? HWATU_TYPES[group.type].labelKo : HWATU_TYPES[group.type].label}
                  <span className="ml-1.5 font-normal text-ink-soft">
                    {ko ? HWATU_TYPES[group.type].label : HWATU_TYPES[group.type].labelKo}
                  </span>
                </span>
              </td>
            </tr>
            {group.rows.map((row) => (
              <tr key={row.en} className="border-t border-hairline">
                <td className="py-3 text-body align-top">{ko ? row.ko : row.en}</td>
                <td className="py-3 text-body font-bold tabular-nums text-right align-top whitespace-nowrap">
                  {row.value}
                </td>
              </tr>
            ))}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}

/* -------------------------------------------------------------------------- */
/* Category blocks                                                            */
/* -------------------------------------------------------------------------- */

function CategoryHeader({ type }: { type: HwatuType }) {
  const { locale } = useLocale();
  const meta = HWATU_TYPES[type];
  const [main, sub] = locale === 'ko' ? [meta.labelKo, meta.label] : [meta.label, meta.labelKo];
  return (
    <header className="flex items-center gap-3 mb-3">
      <span className={`size-3 rounded-full shrink-0 ${TYPE_DOT[type]}`} aria-hidden />
      <h3 className="font-display text-sub">
        {main}
        <span className="ml-2 font-display text-ink-soft">{sub}</span>
      </h3>
    </header>
  );
}

function ComboRow({
  nameEn,
  nameKo,
  points,
  cardIds,
}: {
  nameEn: string;
  nameKo: string;
  points: number;
  cardIds: ReadonlyArray<string>;
}) {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  return (
    <div className="grid gap-2.5 border-t border-hairline pt-3.5">
      <div className="flex items-baseline justify-between gap-3">
        <strong className="font-bold">{ko ? nameKo : nameEn}</strong>
        <span className="font-bold tabular-nums">+{points}</span>
      </div>
      <CardsGrid cards={cardsById(cardIds)} ko={ko} />
    </div>
  );
}

function CardsGrid({ cards, ko, label }: { cards: HwatuCard[]; ko: boolean; label?: ReactNode }) {
  return (
    <div className={label ? 'grid gap-2.5 border-t border-hairline pt-3.5' : undefined}>
      {label && (
        <div className="flex items-baseline justify-between gap-3">
          <strong className="font-bold">{label}</strong>
        </div>
      )}
      <div className="grid max-w-[420px] grid-cols-5 gap-2 md:max-w-none md:[grid-template-columns:repeat(auto-fill,68px)]">
        {cards.map((card) => (
          <ScoreCardArt key={card.id} card={card} ko={ko} />
        ))}
      </div>
    </div>
  );
}

function CategoryBlock({ type }: { type: HwatuType }) {
  const { locale } = useLocale();
  const ko = locale === 'ko';

  return (
    <article className="club-card p-5 sm:p-6">
      <CategoryHeader type={type} />
      <p className="mb-4 max-w-[60ch] text-body">{RULE[type][ko ? 'ko' : 'en']}</p>

      {type === 'tti' && (
        <div className="mt-3.5 space-y-3.5">
          <ComboRow
            nameEn="홍단 · Red set"
            nameKo="홍단 · 홍색 세트"
            points={SCORING.combos.hongdan}
            cardIds={HONGDAN_IDS}
          />
          <ComboRow
            nameEn="청단 · Blue set"
            nameKo="청단 · 청색 세트"
            points={SCORING.combos.cheongdan}
            cardIds={CHEONGDAN_IDS}
          />
          <ComboRow
            nameEn="초단 · Grass set"
            nameKo="초단 · 초록 세트"
            points={SCORING.combos.chodan}
            cardIds={CHODAN_IDS}
          />
        </div>
      )}

      {type === 'kkeut' && (
        <div className="mt-3.5 space-y-3.5">
          <ComboRow
            nameEn="고도리 · Godori"
            nameKo="고도리"
            points={SCORING.combos.godori}
            cardIds={GODORI_IDS}
          />
          <CardsGrid
            cards={cardsOfType('kkeut')}
            ko={ko}
            label={ko ? '열 9장 전부' : 'All 9 Animals'}
          />
        </div>
      )}

      {type === 'gwang' && (
        <div className="mt-3.5">
          <CardsGrid cards={cardsOfType('gwang')} ko={ko} />
        </div>
      )}

      {type === 'pi' && (
        <div className="mt-3.5">
          <CardsGrid
            cards={cardsOfType('pi')}
            ko={ko}
            label={ko ? '피 24장 전부' : 'All 24 Junk'}
          />
        </div>
      )}

      {NOTE[type] && (
        <p className="mt-3.5 text-label text-ink-soft">{NOTE[type]![ko ? 'ko' : 'en']}</p>
      )}
    </article>
  );
}

const RULE: Record<HwatuType, { en: string; ko: string }> = {
  gwang: {
    en: `Collect ${SCORING.brights.three} or more of the 5 Brights.`,
    ko: `광 5장 중 ${SCORING.brights.three}장 이상을 모으면 점수가 돼요.`,
  },
  tti: {
    en: 'Any 5 Ribbons score 1 point, plus 1 for each extra. A full set of 3 scores 3 more on top.',
    ko: `띠는 ${SCORING.ribbonsStartAt}장부터 1점, 이후 한 장마다 +1점. 같은 색 3장을 모으면 추가로 점수가 붙어요.`,
  },
  kkeut: {
    en: 'Any 5 Animals score 1 point, plus 1 for each extra. The three birds together score 5 more.',
    ko: `열은 ${SCORING.animalsStartAt}장부터 1점, 이후 한 장마다 +1점. 새 3마리를 모으면 고도리로 추가 점수.`,
  },
  pi: {
    en: '10 Junk score 1 point, plus 1 for each extra. Double junk counts as 2.',
    ko: `피는 ${SCORING.junkStartAt}장부터 1점, 이후 한 장마다 +1점. 쌍피는 두 장으로 셈해요.`,
  },
};

const NOTE: Partial<Record<HwatuType, { en: string; ko: string }>> = {
  tti: {
    en: 'The Dec ribbon counts toward your 5 Ribbons but belongs to no set.',
    ko: '12월 띠는 5장 카운트엔 포함되지만 어떤 세트에도 속하지 않아요.',
  },
  kkeut: {
    en: 'The Sep sake cup counts as an Animal or as 2 Junk. You pick whichever scores higher.',
    ko: '9월 술잔은 열 또는 쌍피(피 2장)로 셀 수 있어요. 더 높은 점수가 되는 쪽으로 계산돼요.',
  },
};
