'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLocale } from '@/contexts/locale-context';
import { FadeInOnView } from '@/components/fade-in-on-view';
import { SectionTitle } from '@/components/section-title';
import { GOSTOP_SECTIONS } from '@/lib/sections';
import { callThreshold } from '@/config/rules';
import { StepThrough, type Scenario, type Step } from '@/components/turn-stage';

const SECTION = GOSTOP_SECTIONS.find((s) => s.id === 'section-flow')!;

/* -------------------------------------------------------------------------- */
/* Scenarios — 3 players, 6 on the floor, 21 in the deck (CLAUDE.md's resolved   */
/* floor-count decision: F = 6, D = 48 − 21 − F = 21).                          */
/* -------------------------------------------------------------------------- */

const HAND = ['01-gwang', '03-tti', '07-pi-1', '09-kkeut'];
const FLOOR_NORMAL = ['01-pi-1', '02-tti', '04-pi-1', '08-gwang', '10-kkeut', '11-pi-3'];

const NORMAL_STEPS: Step[] = [
  {
    id: 'setup',
    title: 'Deal the cards.',
    titleKo: '패를 나눠요.',
    desc: 'Each player has 7 cards. 6 cards are face up on the floor, and 21 are left in the deck.',
    descKo: '각 플레이어는 7장씩 가져요. 바닥엔 6장이 펼쳐져 있고, 더미엔 21장이 남아요.',
    state: { hand: HAND, floor: FLOOR_NORMAL, taken: [], deckCount: 21 },
  },
  {
    id: 'pick',
    title: 'Pick a card that matches.',
    titleKo: '매치되는 카드를 골라요.',
    desc: 'Find a hand card with the same month as a floor card. Your January Bright matches the January Junk card on the floor.',
    descKo: '바닥 카드와 같은 달의 손패 카드를 찾아요. 내 1월 광이 바닥의 1월 피 카드와 맞아요.',
    state: {
      hand: HAND,
      floor: FLOOR_NORMAL,
      taken: [],
      deckCount: 21,
      highlight: { hand: '01-gwang', floor: ['01-pi-1'] },
    },
  },
  {
    id: 'match',
    title: 'Take the pair.',
    titleKo: '짝을 가져가요.',
    desc: "Both January cards go to your pile, face up, so everyone can see what you've captured.",
    descKo:
      '1월 카드 두 장 모두 내 더미로 가요. 앞면이 보이게 놓아서 모두가 내가 가져간 걸 볼 수 있어요.',
    state: {
      hand: ['03-tti', '07-pi-1', '09-kkeut'],
      floor: ['02-tti', '04-pi-1', '08-gwang', '10-kkeut', '11-pi-3'],
      taken: ['01-gwang', '01-pi-1'],
      deckCount: 21,
      highlight: { taken: ['01-gwang', '01-pi-1'] },
    },
  },
  {
    id: 'flip',
    title: 'Flip the top card of the deck.',
    titleKo: '더미 맨 위 카드를 뒤집어요.',
    desc: "If it matches a floor card, you take that pair too. This flip is a May Junk card, and there's no May on the floor, so it stays on the floor.",
    descKo:
      '바닥 카드와 맞으면 그 짝도 가져가요. 이번에 뒤집은 건 5월 피 카드인데, 바닥에 5월이 없어서 그대로 바닥에 남아요.',
    state: {
      hand: ['03-tti', '07-pi-1', '09-kkeut'],
      floor: ['02-tti', '04-pi-1', '08-gwang', '10-kkeut', '11-pi-3', '05-pi-1'],
      taken: ['01-gwang', '01-pi-1'],
      deckCount: 20,
      flipped: '05-pi-1',
    },
  },
  {
    id: 'end',
    title: 'Your turn ends.',
    titleKo: '내 차례가 끝나요.',
    desc: `Play passes to the next player. Once you reach ${callThreshold(3)} points (${callThreshold(2)} with 2 players), you choose Go or Stop.`,
    descKo: `다음 사람에게 차례가 넘어가요. ${callThreshold(3)}점(2인전은 ${callThreshold(2)}점)에 도달하면 고 또는 스톱을 선택해요.`,
    state: {
      hand: ['03-tti', '07-pi-1', '09-kkeut'],
      floor: ['02-tti', '04-pi-1', '08-gwang', '10-kkeut', '11-pi-3', '05-pi-1'],
      taken: ['01-gwang', '01-pi-1'],
      deckCount: 20,
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Double match                                                                */
/* -------------------------------------------------------------------------- */

const DOUBLE_HAND_INIT = ['01-gwang', '05-tti', '07-pi-1', '09-kkeut'];
const DOUBLE_FLOOR_INIT = ['01-pi-1', '05-pi-1', '04-pi-1', '08-gwang', '10-kkeut', '11-pi-3'];
const DOUBLE_HAND_AFTER = ['05-tti', '07-pi-1', '09-kkeut'];

const DOUBLE_STEPS: Step[] = [
  {
    id: 'setup',
    title: 'Play the January Bright.',
    titleKo: '1월 광을 내요.',
    desc: 'The floor has a January Junk card, so your January Bright matches it.',
    descKo: '바닥에 1월 피 카드가 있어서 내 1월 광과 맞아요.',
    state: {
      hand: DOUBLE_HAND_INIT,
      floor: DOUBLE_FLOOR_INIT,
      taken: [],
      deckCount: 21,
      highlight: { hand: '01-gwang', floor: ['01-pi-1'] },
    },
  },
  {
    id: 'match',
    title: 'Take the January pair.',
    titleKo: '1월 짝을 가져가요.',
    desc: 'Both January cards go to your pile.',
    descKo: '1월 카드 두 장 모두 내 더미로 가요.',
    state: {
      hand: DOUBLE_HAND_AFTER,
      floor: ['05-pi-1', '04-pi-1', '08-gwang', '10-kkeut', '11-pi-3'],
      taken: ['01-gwang', '01-pi-1'],
      deckCount: 21,
      highlight: { taken: ['01-gwang', '01-pi-1'] },
    },
  },
  {
    id: 'flip-match',
    title: 'The flip is May, and it matches too.',
    titleKo: '뒤집은 카드가 5월, 이것도 맞아요.',
    desc: 'You flip a May Junk card, and there’s a May card on the floor. Another pair.',
    descKo: '5월 피 카드를 뒤집었는데 바닥에도 5월 카드가 있어요. 또 한 쌍.',
    state: {
      hand: DOUBLE_HAND_AFTER,
      floor: ['05-pi-1', '04-pi-1', '08-gwang', '10-kkeut', '11-pi-3'],
      taken: ['01-gwang', '01-pi-1'],
      deckCount: 20,
      flipped: '05-pi-2',
      highlight: { floor: ['05-pi-1'] },
    },
  },
  {
    id: 'take-both',
    title: 'Take the May pair.',
    titleKo: '5월 짝을 가져가요.',
    desc: "Four cards in one turn. There's no junk bonus here; that only comes from the special moves in 05.",
    descKo:
      '한 턴에 네 장. 여기서는 피 보너스가 없어요 — 보너스는 05 특수 규칙의 움직임에서만 나와요.',
    state: {
      hand: DOUBLE_HAND_AFTER,
      floor: ['04-pi-1', '08-gwang', '10-kkeut', '11-pi-3'],
      taken: ['01-gwang', '01-pi-1', '05-pi-2', '05-pi-1'],
      deckCount: 20,
      highlight: { taken: ['05-pi-2', '05-pi-1'] },
    },
  },
];

/* -------------------------------------------------------------------------- */
/* No match                                                                    */
/* -------------------------------------------------------------------------- */

const NOMATCH_HAND_INIT = ['01-gwang', '03-tti', '07-pi-1', '09-kkeut'];
const NOMATCH_FLOOR_INIT = ['02-tti', '04-pi-1', '04-pi-2', '11-pi-3', '12-pi', '12-tti'];
const NOMATCH_HAND_AFTER = ['03-tti', '07-pi-1', '09-kkeut'];

const NOMATCH_STEPS: Step[] = [
  {
    id: 'setup',
    title: 'No month in common.',
    titleKo: '겹치는 달이 없어요.',
    desc: 'The floor has February, April, November, and December. Your hand has January, March, July, and September. Nothing matches.',
    descKo:
      '바닥엔 2월, 4월, 11월, 12월이 있어요. 내 손패엔 1월, 3월, 7월, 9월이 있고요. 아무것도 안 맞아요.',
    state: {
      hand: NOMATCH_HAND_INIT,
      floor: NOMATCH_FLOOR_INIT,
      taken: [],
      deckCount: 21,
    },
  },
  {
    id: 'discard',
    title: 'You still play a card.',
    titleKo: '그래도 한 장은 내야 해요.',
    desc: 'Put one hand card face up on the floor. Someone can take it later.',
    descKo: '손패 한 장을 앞면이 보이게 바닥에 놓아요. 나중에 다른 사람이 가져갈 수 있어요.',
    state: {
      hand: NOMATCH_HAND_AFTER,
      floor: [...NOMATCH_FLOOR_INIT, '01-gwang'],
      taken: [],
      deckCount: 21,
      highlight: { floor: ['01-gwang'] },
    },
  },
  {
    id: 'flip-no-match',
    title: 'Flip. No match again.',
    titleKo: '뒤집어요. 이번에도 매치 없음.',
    desc: "You flip a July Junk card. There's no July on the floor, so it stays there. You capture nothing this turn.",
    descKo:
      '7월 피 카드를 뒤집었어요. 바닥에 7월이 없어서 그대로 남아요. 이번 턴엔 아무것도 못 가져가요.',
    state: {
      hand: NOMATCH_HAND_AFTER,
      floor: [...NOMATCH_FLOOR_INIT, '01-gwang', '07-pi-2'],
      taken: [],
      deckCount: 20,
      highlight: { floor: ['07-pi-2'] },
    },
  },
];

const SCENARIOS: ReadonlyArray<Scenario> = [
  {
    id: 'normal',
    label: 'Normal turn',
    labelKo: '기본 흐름',
    blurb: 'One match from your hand, no match from the flip.',
    blurbKo: '손패에서 한 번 매치되고, 뒤집은 카드는 매치되지 않아요.',
    steps: NORMAL_STEPS,
  },
  {
    id: 'double',
    label: 'Double match',
    labelKo: '더블 매치',
    blurb: 'Your hand card and your flip each catch a different card. Two pairs in one turn.',
    blurbKo: '내 손패 카드와 뒤집은 카드가 각각 다른 카드를 가져가요. 한 턴에 두 쌍.',
    steps: DOUBLE_STEPS,
  },
  {
    id: 'no-match',
    label: 'No match',
    labelKo: '매치 없음',
    blurb: 'Nothing matches from your hand or your flip.',
    blurbKo: '손패도, 뒤집은 카드도 아무것도 맞지 않아요.',
    steps: NOMATCH_STEPS,
  },
];

/* -------------------------------------------------------------------------- */
/* Main section                                                                */
/* -------------------------------------------------------------------------- */

export function SectionFlow() {
  const { locale } = useLocale();
  const [scenarioId, setScenarioId] = useState<string>('normal');

  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];

  return (
    <section id="section-flow" className="relative py-24 border-t border-hairline section-flow-bg">
      <div className="lg:ml-72">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-16">
          <SectionTitle section={SECTION} />
          <FadeInOnView
            as="p"
            delay={0.12}
            className="text-body text-ink-soft max-w-[65ch] leading-relaxed mb-8"
          >
            {locale === 'ko'
              ? '매 턴은 두 단계예요 — 손패에서 카드를 한 장 내고, 더미 맨 위 카드를 뒤집어요. 카드는 같은 달의 바닥 카드를 가져가요.'
              : 'Every turn has two steps: play one card from your hand, then flip the top card of the deck. A card captures a floor card of the same month.'}
          </FadeInOnView>

          {/* Scenario selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            {SCENARIOS.map((s) => {
              const isActive = scenario.id === s.id;
              return (
                <motion.button
                  key={s.id}
                  type="button"
                  onClick={() => setScenarioId(s.id)}
                  whileTap={{ scale: 0.94 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                    mass: 0.6,
                  }}
                  className={`relative px-3.5 py-1.5 rounded-full text-label transition-colors ${
                    isActive ? 'text-surface font-medium' : 'bg-surface text-ink'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="flow-scenario-pill"
                      className="absolute inset-0 rounded-full bg-plum"
                      transition={{
                        type: 'spring',
                        stiffness: 480,
                        damping: 28,
                        mass: 0.7,
                      }}
                    />
                  )}
                  <span className="relative z-10">{locale === 'ko' ? s.labelKo : s.label}</span>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={scenario.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="text-body text-ink-soft mb-8 max-w-[65ch] leading-relaxed"
            >
              {locale === 'ko' ? scenario.blurbKo : scenario.blurb}
            </motion.p>
          </AnimatePresence>

          <StepThrough steps={scenario.steps} key={scenario.id} />

          {scenario.id === 'double' && (
            <p className="mt-8 text-label text-ink-soft max-w-[65ch]">
              {locale === 'ko'
                ? '바닥에 내 카드와 같은 달의 카드가 두 장 있으면, 어느 걸 가져갈지 내가 골라요. 나머지 한 장은 그대로 남아요.'
                : "If two floor cards share your card's month, you pick which one to take. The other stays."}
            </p>
          )}

          <p className="mt-8 text-label text-ink-soft max-w-[65ch]">
            {locale === 'ko'
              ? '쪽·따닥·폭탄·뻑·싹쓸이 같은 특수 상황은 05 특수 규칙에서 다뤄요.'
              : 'Special moves like Jjok and Ppeok are covered in 05 Special Rules.'}
          </p>
        </div>
      </div>
    </section>
  );
}
