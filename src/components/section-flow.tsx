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
/* Scenarios                                                                   */
/* -------------------------------------------------------------------------- */

const HAND = ['01-gwang', '03-tti', '07-pi-1', '09-kkeut'];
const FLOOR_NORMAL = ['01-pi-1', '04-pi-1', '08-gwang', '11-pi-3'];

const NORMAL_STEPS: Step[] = [
  {
    id: 'setup',
    title: 'Deal the cards',
    titleKo: '패를 분배해요',
    desc: 'In a 3-player game, each player gets 7 cards in hand. 8 cards lie face-up on the floor (바닥, badak). The remaining 19 form the deck.',
    descKo:
      '3인 고스톱 기준 — 각자 7장씩 손패를 받고, 바닥(공유 영역)에는 8장이 펼쳐져요. 남은 19장은 더미.',
    state: { hand: HAND, floor: FLOOR_NORMAL, taken: [], deckCount: 19 },
  },
  {
    id: 'pick',
    title: 'Pick a card from your hand',
    titleKo: '손패에서 카드를 골라요',
    desc: 'Look for a hand card whose month matches one on the floor. The January bright in hand pairs with the January pi on the floor.',
    descKo:
      '내 손패와 바닥에서 같은 월(月)의 카드를 찾아요. 1월 광(송학)이 바닥의 1월 피와 짝이 맞네요.',
    state: {
      hand: HAND,
      floor: FLOOR_NORMAL,
      taken: [],
      deckCount: 19,
      highlight: { hand: '01-gwang', floor: ['01-pi-1'] },
    },
  },
  {
    id: 'match',
    title: 'Take the matched pair',
    titleKo: '쌍을 먹어요',
    desc: 'Both cards move to your taken pile. Cards are kept face-up so everyone can see your score.',
    descKo:
      '두 카드 모두 내 먹은 패로 들어가요. 먹은 패는 공개돼서 모두가 점수를 확인할 수 있어요.',
    state: {
      hand: ['03-tti', '07-pi-1', '09-kkeut'],
      floor: ['04-pi-1', '08-gwang', '11-pi-3'],
      taken: ['01-gwang', '01-pi-1'],
      deckCount: 19,
      highlight: { taken: ['01-gwang', '01-pi-1'] },
    },
  },
  {
    id: 'flip',
    title: 'Flip the top deck card',
    titleKo: '더미에서 한 장 뒤집어요',
    desc: 'After playing, you flip the top card from the deck. If it matches a card on the floor, you take that pair too. Here, the May pi has no match — it joins the floor.',
    descKo:
      '손패를 낸 후, 더미 맨 위 카드를 뒤집어요. 바닥과 매치되면 또 한 쌍을 가져갈 수 있어요. 여기선 5월 피가 짝이 없어서 그냥 바닥에 놓여요.',
    state: {
      hand: ['03-tti', '07-pi-1', '09-kkeut'],
      floor: ['04-pi-1', '08-gwang', '11-pi-3'],
      taken: ['01-gwang', '01-pi-1'],
      deckCount: 18,
      flipped: '05-pi-1',
    },
  },
  {
    id: 'end',
    title: 'Turn ends',
    titleKo: '차례가 끝나요',
    desc: `Your turn passes. Once you reach ${callThreshold(3)} points (${callThreshold(2)} with two players), you'll decide: 'go' (continue for more) or 'stop' (end the round and score).`,
    descKo: `내 차례가 끝나고 다음 사람으로 넘어가요. ${callThreshold(3)}점(2인은 ${callThreshold(2)}점)에 도달하면 결정해야 해요 — 고(계속) 또는 스톱(멈춤).`,
    state: {
      hand: ['03-tti', '07-pi-1', '09-kkeut'],
      floor: ['04-pi-1', '08-gwang', '11-pi-3', '05-pi-1'],
      taken: ['01-gwang', '01-pi-1'],
      deckCount: 18,
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Normal — double match (hand match + flip also matches)                      */
/* -------------------------------------------------------------------------- */

const DOUBLE_HAND_INIT = ['01-gwang', '05-tti', '07-pi-1', '09-kkeut'];
const DOUBLE_FLOOR_INIT = ['01-pi-1', '05-pi-1', '08-gwang', '11-pi-3'];
const DOUBLE_HAND_AFTER = ['05-tti', '07-pi-1', '09-kkeut'];

const DOUBLE_STEPS: Step[] = [
  {
    id: 'setup',
    title: 'Pick the January bright',
    titleKo: '1월 광을 골라요',
    desc: 'Floor has a January pi — straightforward pair-take, just like the basic turn.',
    descKo: '바닥에 1월 피가 있어서 1월 광으로 매치하면 평범한 쌍 매치가 돼요.',
    state: {
      hand: DOUBLE_HAND_INIT,
      floor: DOUBLE_FLOOR_INIT,
      taken: [],
      deckCount: 19,
      highlight: { hand: '01-gwang', floor: ['01-pi-1'] },
    },
  },
  {
    id: 'match',
    title: 'Take the January pair',
    titleKo: '1월 쌍을 먹어요',
    desc: 'January bright + January pi go to your taken pile.',
    descKo: '1월 광과 1월 피가 내 먹은 패로.',
    state: {
      hand: DOUBLE_HAND_AFTER,
      floor: ['05-pi-1', '08-gwang', '11-pi-3'],
      taken: ['01-gwang', '01-pi-1'],
      deckCount: 19,
      highlight: { taken: ['01-gwang', '01-pi-1'] },
    },
  },
  {
    id: 'flip-match',
    title: 'Flip is May — also matches!',
    titleKo: '더미를 뒤집었더니 5월 — 매치!',
    desc: "You flip the deck. It's May pi, and the floor still has a May piece. Lucky double match in one turn.",
    descKo:
      '더미를 뒤집었더니 5월 피. 바닥에 5월이 아직 있어서 또 한 쌍이 매치돼요. 한 턴에 두 쌍을 가져가는 운 좋은 차례.',
    state: {
      hand: DOUBLE_HAND_AFTER,
      floor: ['05-pi-1', '08-gwang', '11-pi-3'],
      taken: ['01-gwang', '01-pi-1'],
      deckCount: 18,
      flipped: '05-pi-2',
      highlight: { floor: ['05-pi-1'] },
    },
  },
  {
    id: 'take-both',
    title: 'Take May pair too',
    titleKo: '5월 쌍도 먹어요',
    desc: "Both May cards now join your taken pile. Four cards harvested in a single turn — no bonus pi though, since this isn't a jjok or ttadak.",
    descKo:
      '5월 카드 두 장 모두 내 먹은 패로. 한 턴에 4장 수확! 단, 쪽이나 따닥이 아니라서 보너스 피는 없어요.',
    state: {
      hand: DOUBLE_HAND_AFTER,
      floor: ['08-gwang', '11-pi-3'],
      taken: ['01-gwang', '01-pi-1', '05-pi-2', '05-pi-1'],
      deckCount: 18,
      highlight: { taken: ['05-pi-2', '05-pi-1'] },
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Normal — no match (forced discard)                                          */
/* -------------------------------------------------------------------------- */

const NOMATCH_HAND_INIT = ['01-gwang', '03-tti', '07-pi-1', '09-kkeut'];
const NOMATCH_FLOOR_INIT = ['02-tti', '04-pi-1', '11-pi-3', '12-pi'];
const NOMATCH_HAND_AFTER = ['03-tti', '07-pi-1', '09-kkeut'];

const NOMATCH_STEPS: Step[] = [
  {
    id: 'setup',
    title: 'No matching month in hand',
    titleKo: '손에 매치할 월이 없어요',
    desc: 'Look at the floor — February, April, November, December. Your hand has January, March, July, September. Zero overlap.',
    descKo: '바닥은 2/4/11/12월. 내 손은 1/3/7/9월. 겹치는 월이 하나도 없어요.',
    state: {
      hand: NOMATCH_HAND_INIT,
      floor: NOMATCH_FLOOR_INIT,
      taken: [],
      deckCount: 19,
    },
  },
  {
    id: 'discard',
    title: 'Discard a card to the floor',
    titleKo: '한 장을 바닥에 버려요',
    desc: "When you can't match, you must still play a card from your hand — it just sits face-up on the floor for someone else to take later.",
    descKo:
      '매치할 수 없을 땐 그래도 손패 한 장은 내야 해요. 그 카드는 그냥 바닥에 놓여서 나중에 다른 사람이 가져갈 수 있어요.',
    state: {
      hand: NOMATCH_HAND_AFTER,
      floor: [...NOMATCH_FLOOR_INIT, '01-gwang'],
      taken: [],
      deckCount: 19,
      highlight: { floor: ['01-gwang'] },
    },
  },
  {
    id: 'flip-no-match',
    title: 'Flip the deck — also no match',
    titleKo: '더미 뒤집기 — 이것도 매치 없음',
    desc: "You still flip the top deck card. July pi doesn't match any month on the floor either, so it joins the floor too. Empty-handed turn.",
    descKo: '더미도 뒤집어요. 7월 피도 바닥과 안 맞아서 바닥행. 한 장도 못 가져간 빈손 차례.',
    state: {
      hand: NOMATCH_HAND_AFTER,
      floor: [...NOMATCH_FLOOR_INIT, '01-gwang', '07-pi-2'],
      taken: [],
      deckCount: 18,
      highlight: { floor: ['07-pi-2'] },
    },
  },
];

const SCENARIOS: ReadonlyArray<Scenario> = [
  {
    id: 'normal',
    label: 'Normal turn',
    labelKo: '기본 흐름',
    blurb: 'A vanilla turn with a single match.',
    blurbKo: '한 번 매치되는 평범한 차례.',
    steps: NORMAL_STEPS,
  },
  {
    id: 'double',
    label: 'Double match',
    labelKo: '더블 매치',
    blurb:
      'Hand play matches one floor card, then the deck flip also matches a different floor card. Two pairs in one turn.',
    blurbKo:
      '손패가 바닥과 매치된 후, 더미에서 뒤집은 카드도 바닥의 다른 카드와 매치. 한 턴에 두 쌍.',
    steps: DOUBLE_STEPS,
  },
  {
    id: 'no-match',
    label: 'No match',
    labelKo: '매치 없음',
    blurb:
      'Your hand has no matching month and the deck flip is also a miss. You discard a card and end the turn empty-handed.',
    blurbKo: '손에 매치할 월도 없고 더미 뒤집기도 빗나가요. 카드 한 장 버리고 빈손으로 차례 종료.',
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
              ? '한 턴의 흐름을 따라가 봐요. 기본 흐름부터 보고, 그 다음에 더블 매치와 매치 없음도 살펴보세요.'
              : 'Follow one turn from start to finish. Start with the normal flow, then look at a double match and a turn with no match at all.'}
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
