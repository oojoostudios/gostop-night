'use client';

import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Plus, Lock, Zap, AlertTriangle } from 'lucide-react';
import { useLocale } from '@/contexts/locale-context';
import { FadeInOnView } from '@/components/fade-in-on-view';
import { SectionTitle } from '@/components/section-title';
import { HwatuCardImage } from '@/components/hwatu-card-image';
import { GOSTOP_SECTIONS } from '@/lib/sections';
import { HWATU_DECK } from '@/lib/hwatu';
import { RULES, SCORING, bakRules } from '@/config/rules';
import { BAK_FACTOR } from '@/lib/tonight';
import { StepThrough, type Step } from '@/components/turn-stage';

const SECTION = GOSTOP_SECTIONS.find((s) => s.id === 'section-special')!;

const cardById = (id: string) => HWATU_DECK.find((c) => c.id === id);

/* -------------------------------------------------------------------------- */
/* Animation data — moved here from Section 03. Ttadak and Bomb use the months  */
/* from the written example below (March, August); Jjok, Ppeok and Sweep were   */
/* already correct. Self-ppeok is deleted, not moved.                           */
/* -------------------------------------------------------------------------- */

const JJOK_HAND_INIT = ['01-gwang', '03-tti', '07-pi-1', '09-kkeut'];
const JJOK_FLOOR_INIT = ['04-pi-1', '08-gwang', '11-pi-3']; // no January
const JJOK_HAND_AFTER = ['03-tti', '07-pi-1', '09-kkeut'];

const JJOK_STEPS: Step[] = [
  {
    id: 'setup',
    title: 'January bright in hand, no January on floor',
    titleKo: '내 손엔 1월 광, 바닥엔 1월 없음',
    desc: "You hold the January bright. Looking at the floor, there's no January card to match against — so when you play it, it'll just join the floor.",
    descKo:
      '1월 광을 손에 들고 있어요. 바닥엔 1월이 하나도 없으니 그냥 광을 내면 바닥으로 가버리겠죠.',
    state: {
      hand: JJOK_HAND_INIT,
      floor: JJOK_FLOOR_INIT,
      taken: [],
      deckCount: 19,
      highlight: { hand: '01-gwang' },
    },
  },
  {
    id: 'no-match',
    title: 'Played — joins the floor',
    titleKo: '내고 보니 바닥행',
    desc: 'You play the January bright. Without a partner on the floor, it sits face-up on the floor.',
    descKo: '1월 광을 냈지만 짝이 없어서 그대로 바닥에 놓여요.',
    state: {
      hand: JJOK_HAND_AFTER,
      floor: [...JJOK_FLOOR_INIT, '01-gwang'],
      taken: [],
      deckCount: 19,
      highlight: { floor: ['01-gwang'] },
    },
  },
  {
    id: 'flip-match',
    title: 'Flip — same month!',
    titleKo: '더미를 뒤집었더니… 같은 월!',
    desc: "Now you flip the top deck card. It's January — same month as the card you just placed. That's 쪽 (jjok).",
    descKo: '더미를 뒤집었더니 1월! 방금 내가 낸 1월 광과 같은 월이에요. 이게 바로 쪽이에요.',
    state: {
      hand: JJOK_HAND_AFTER,
      floor: [...JJOK_FLOOR_INIT, '01-gwang'],
      taken: [],
      deckCount: 18,
      flipped: '01-pi-1',
      highlight: { floor: ['01-gwang'] },
    },
  },
  {
    id: 'take-bonus',
    title: 'Take both + bonus pi',
    titleKo: '둘 다 가져가고 보너스 피',
    desc: 'Both January cards go to your taken pile. Plus, every other player gives you one pi each — bonus reward for the lucky flip.',
    descKo:
      '두 카드 모두 내 먹은 패로. 추가로 상대방 한 명당 피 한 장씩 — 운 좋은 짝 만남에 대한 보너스예요.',
    state: {
      hand: JJOK_HAND_AFTER,
      floor: JJOK_FLOOR_INIT,
      taken: ['01-gwang', '01-pi-1'],
      deckCount: 18,
      highlight: { taken: ['01-gwang', '01-pi-1'] },
      bonusPi: 2,
    },
  },
];

const TTADAK_HAND_INIT = ['03-gwang', '07-pi-1', '09-kkeut', '11-pi-3'];
const TTADAK_FLOOR_INIT = ['03-pi-1', '03-pi-2', '08-gwang']; // 2x March
const TTADAK_HAND_AFTER = ['07-pi-1', '09-kkeut', '11-pi-3'];

const TTADAK_STEPS: Step[] = [
  {
    id: 'setup',
    title: 'Two March already on the floor',
    titleKo: '바닥에 3월이 벌써 2장',
    desc: 'The floor already shows two March pi cards (left over from earlier turns). You happen to be holding the March bright.',
    descKo: '이전 차례들의 결과로 바닥엔 3월 피 2장이 있어요. 마침 내 손엔 3월 광이 들려있고요.',
    state: {
      hand: TTADAK_HAND_INIT,
      floor: TTADAK_FLOOR_INIT,
      taken: [],
      deckCount: 19,
      highlight: { hand: '03-gwang', floor: ['03-pi-1', '03-pi-2'] },
    },
  },
  {
    id: 'match-three',
    title: 'Match grabs all three',
    titleKo: '한 번에 3장',
    desc: 'When you play your March bright, it matches both floor cards. All three go into your taken pile.',
    descKo: '3월 광을 내면 바닥의 3월 두 장과 한꺼번에 매치돼요. 세 장 모두 내 먹은 패로.',
    state: {
      hand: TTADAK_HAND_AFTER,
      floor: ['08-gwang'],
      taken: ['03-gwang', '03-pi-1', '03-pi-2'],
      deckCount: 19,
      highlight: { taken: ['03-gwang', '03-pi-1', '03-pi-2'] },
    },
  },
  {
    id: 'flip-ttadak',
    title: 'Flip is March too — ttadak!',
    titleKo: '더미도 3월 — 따닥!',
    desc: "You flip the deck card and it's another March — the fourth of the month. Since nothing on the floor is left to match, it comes straight to your pile too. That's 따닥 (ttadak) — bonus pi from each opponent.",
    descKo:
      '더미를 뒤집었더니 또 3월. 바닥엔 이제 3월이 없으니 그냥 내 먹은 패로 들어와요. 이게 따닥 — 상대 한 명당 피 한 장씩 받아요.',
    state: {
      hand: TTADAK_HAND_AFTER,
      floor: ['08-gwang'],
      taken: ['03-gwang', '03-pi-1', '03-pi-2', '03-tti'],
      deckCount: 18,
      highlight: { taken: ['03-tti'] },
      bonusPi: 2,
    },
  },
];

const PPEOK_HAND_INIT = ['01-gwang', '03-tti', '07-pi-1', '09-kkeut'];
const PPEOK_FLOOR_INIT = ['01-pi-1', '04-pi-1', '08-gwang']; // 1x January
const PPEOK_HAND_AFTER = ['03-tti', '07-pi-1', '09-kkeut'];

const PPEOK_STEPS: Step[] = [
  {
    id: 'setup',
    title: 'Hand match looks easy',
    titleKo: '손패 매치는 평범해 보여요',
    desc: 'You hold the January bright, and the floor has a January pi. A normal pair-take, right?',
    descKo: '1월 광을 내려고 해요. 바닥에 1월 피가 한 장 있으니 평범한 쌍 매치 같죠?',
    state: {
      hand: PPEOK_HAND_INIT,
      floor: PPEOK_FLOOR_INIT,
      taken: [],
      deckCount: 19,
      highlight: { hand: '01-gwang', floor: ['01-pi-1'] },
    },
  },
  {
    id: 'flip-third',
    title: 'But the flip is also January!',
    titleKo: '근데 더미도 1월이네요?!',
    desc: "You flip the deck card right after. It's another January. That makes three January cards on the floor at once — the situation locks.",
    descKo:
      '곧바로 더미를 뒤집었는데 그것도 1월. 바닥에 1월 카드가 한꺼번에 3장이 모이면 상황이 잠겨버려요.',
    state: {
      hand: PPEOK_HAND_AFTER,
      floor: [...PPEOK_FLOOR_INIT, '01-gwang'],
      taken: [],
      deckCount: 18,
      flipped: '01-pi-2',
      highlight: { floor: ['01-pi-1', '01-gwang'] },
    },
  },
  {
    id: 'locked',
    title: 'Three January stuck on the floor',
    titleKo: '1월 3장이 바닥에 묶여요',
    desc: 'All three January cards now stay on the floor — nobody takes them. The next player who plays a January card will sweep all four (the locked three plus their own), plus 1 junk from each player.',
    descKo:
      '1월 3장이 그대로 바닥에 묶여요. 누구도 못 가져가요. 다음에 1월을 내는 사람이 (자기 카드까지 더해서) 4장 모두 가져가고, 다른 플레이어들에게 피도 한 장씩 받아요.',
    state: {
      hand: PPEOK_HAND_AFTER,
      floor: ['04-pi-1', '08-gwang', '01-pi-1', '01-gwang', '01-pi-2'],
      taken: [],
      deckCount: 18,
      highlight: { locked: ['01-pi-1', '01-gwang', '01-pi-2'] },
    },
  },
];

const SWEEP_HAND_INIT = ['06-kkeut', '07-pi-1', '09-kkeut'];
const SWEEP_HAND_AFTER = ['07-pi-1', '09-kkeut'];
const SWEEP_TAKEN_PRE = ['02-kkeut', '03-gwang', '04-pi-1'];

const SWEEP_STEPS: Step[] = [
  {
    id: 'setup',
    title: 'Late round, only one card on the floor',
    titleKo: '라운드 막바지, 바닥엔 1장뿐',
    desc: "Several turns in. Most floor cards have been taken throughout the round. Just a single June pi remains — and you're holding a June card.",
    descKo:
      '여러 턴이 지나 대부분의 카드가 정리됐어요. 바닥엔 6월 피 한 장만 남아있고, 마침 내 손엔 6월 카드가 있어요.',
    state: {
      hand: SWEEP_HAND_INIT,
      floor: ['06-pi-1'],
      taken: SWEEP_TAKEN_PRE,
      deckCount: 6,
      highlight: { hand: '06-kkeut', floor: ['06-pi-1'] },
    },
  },
  {
    id: 'sweep',
    title: 'Match clears the floor — ssakssalri (sweep)!',
    titleKo: '매치하면 바닥이 텅 비어요 — 싹쓸이!',
    desc: "Your June card takes the lone June pi. The floor is now empty — that's 싹쓸이 (sweep). Every opponent gives you one pi.",
    descKo:
      '6월 카드가 마지막 6월 피와 매치되면서 바닥이 텅 비어요. 이게 싹쓸이! 상대 한 명당 피 1장씩 받아요.',
    state: {
      hand: SWEEP_HAND_AFTER,
      floor: [],
      taken: [...SWEEP_TAKEN_PRE, '06-kkeut', '06-pi-1'],
      deckCount: 6,
      highlight: { taken: ['06-kkeut', '06-pi-1'] },
      bonusPi: 2,
    },
  },
  {
    id: 'flip',
    title: 'Flip lands on empty floor',
    titleKo: '더미 뒤집기는 빈 바닥으로',
    desc: 'After the sweep you still flip from the deck. It has nothing to match — it sits down on the (briefly empty) floor.',
    descKo:
      '싹쓸이 후에도 더미는 뒤집어요. 매치할 카드가 없어서 (잠깐 비었던) 바닥에 그대로 놓여요.',
    state: {
      hand: SWEEP_HAND_AFTER,
      floor: ['05-pi-1'],
      taken: [...SWEEP_TAKEN_PRE, '06-kkeut', '06-pi-1'],
      deckCount: 5,
      bonusPi: 2,
    },
  },
];

const POKDAN_HAND_INIT = ['08-gwang', '08-kkeut', '08-pi-1', '03-tti'];
const POKDAN_FLOOR_INIT = ['08-pi-2', '01-pi-1', '04-pi-1'];
const POKDAN_HAND_AFTER = ['03-tti'];

const POKDAN_STEPS: Step[] = [
  {
    id: 'setup',
    title: 'Three Augusts in hand, one August on floor',
    titleKo: '손엔 8월 3장, 바닥엔 8월 1장',
    desc: "You're holding three August cards (bright + animal + pi). The fourth — an August pi — is sitting on the floor. Bomb condition.",
    descKo:
      '내 손에 8월 카드가 3장 (광·열·피). 그 달의 마지막 한 장이 바닥에 있어요. 폭탄 조건이에요.',
    state: {
      hand: POKDAN_HAND_INIT,
      floor: POKDAN_FLOOR_INIT,
      taken: [],
      deckCount: 19,
      highlight: { hand: ['08-gwang', '08-kkeut', '08-pi-1'], floor: ['08-pi-2'] },
    },
  },
  {
    id: 'drop',
    title: 'Drop all three at once',
    titleKo: '3장을 한꺼번에 던져요',
    desc: 'Instead of one card per turn, you slam all three same-month cards down at once and sweep the floor card too. All four August cards into your taken pile, plus 1 junk from each player.',
    descKo:
      '보통 한 턴에 한 장씩 내지만, 폭탄은 같은 달 3장을 한꺼번에 내려놓고 바닥의 1장까지 함께 쓸어가요. 8월 4장 모두 내 먹은 패로, 다른 플레이어들에게 피도 한 장씩 받아요.',
    state: {
      hand: POKDAN_HAND_AFTER,
      floor: ['01-pi-1', '04-pi-1'],
      taken: ['08-gwang', '08-kkeut', '08-pi-1', '08-pi-2'],
      deckCount: 19,
      highlight: { taken: ['08-gwang', '08-kkeut', '08-pi-1', '08-pi-2'] },
      bonusPi: 2,
    },
  },
  {
    id: 'flip',
    title: 'Flip the deck — bonus pi already earned',
    titleKo: '더미 뒤집기 — 보너스 피는 이미 확보',
    desc: "You still flip a card afterwards. It doesn't match — it joins the floor. The bomb already earned you one pi from each opponent.",
    descKo:
      '그래도 더미는 뒤집어요. 매치가 없어서 바닥행. 폭탄으로 이미 상대 한 명당 피 1장씩 챙긴 상태.',
    state: {
      hand: POKDAN_HAND_AFTER,
      floor: ['01-pi-1', '04-pi-1', '05-pi-1'],
      taken: ['08-gwang', '08-kkeut', '08-pi-1', '08-pi-2'],
      deckCount: 18,
      bonusPi: 2,
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Copy — English text is exactly as written in CLAUDE.md; Korean is a         */
/* same-meaning translation.                                                   */
/* -------------------------------------------------------------------------- */

type RuleCopy = {
  id: string;
  nameEn: string;
  nameKo: string;
  badgeEn: string;
  badgeKo: string;
  neutralBadge?: boolean;
  whenEn: string;
  whenKo: string;
  whatEn: string;
  whatKo: string;
  tradeoffEn?: string;
  tradeoffKo?: string;
  exampleEn: string;
  exampleKo: string;
  steps: ReadonlyArray<Step>;
};

const TAKE_JUNK_RULES: RuleCopy[] = [
  {
    id: 'jjok',
    nameEn: 'Jjok',
    nameKo: '쪽',
    badgeEn: 'Take 1 junk from each',
    badgeKo: '상대 한 명당 피 1장씩',
    whenEn:
      'You play a card that matches nothing, so it stays on the floor. Then the card you flip from the deck is the same month.',
    whenKo:
      '낸 카드가 바닥의 아무 카드와도 맞지 않아 그대로 바닥에 남아요. 그런데 더미에서 뒤집은 카드가 같은 월이에요.',
    whatEn: 'You take both cards, and each player gives you 1 junk.',
    whatKo: '두 카드를 모두 가져가고, 다른 플레이어들이 피를 한 장씩 줘요.',
    exampleEn:
      'You play a January card and nothing matches. You flip another January. Both are yours, plus 1 junk from each player.',
    exampleKo:
      '1월 카드를 냈는데 아무것도 안 맞아요. 더미에서 또 1월을 뒤집어요. 두 장 다 내 것이 되고, 상대 한 명당 피도 1장씩 받아요.',
    steps: JJOK_STEPS,
  },
  {
    id: 'ttadak',
    nameEn: 'Ttadak',
    nameKo: '따닥',
    badgeEn: 'Take 1 junk from each',
    badgeKo: '상대 한 명당 피 1장씩',
    whenEn:
      'Two cards of the same month are on the floor. You play the third from your hand, then flip the fourth.',
    whenKo:
      '바닥에 같은 달 카드가 2장 있어요. 내 손에서 세 번째 카드를 내고, 더미에서 네 번째를 뒤집어요.',
    whatEn: 'You take all four cards, and each player gives you 1 junk.',
    whatKo: '네 장 모두 가져가고, 다른 플레이어들이 피를 한 장씩 줘요.',
    exampleEn:
      'Two March cards are on the floor. You play a March and flip the last March. All four are yours.',
    exampleKo:
      '바닥에 3월 카드가 2장 있어요. 3월을 내고 마지막 3월을 뒤집어요. 네 장 모두 내 것이 돼요.',
    steps: TTADAK_STEPS,
  },
  {
    id: 'bomb',
    nameEn: 'Bomb',
    nameKo: '폭탄',
    badgeEn: 'Take 1 junk from each',
    badgeKo: '상대 한 명당 피 1장씩',
    whenEn: 'You hold three cards of one month and the fourth is on the floor.',
    whenKo: '한 달의 카드 3장을 손에 들고 있고, 나머지 한 장이 바닥에 있어요.',
    whatEn:
      'You play all three at once and take all four, and each player gives you 1 junk. Because you used three cards in one turn, on your next two turns you just flip from the deck.',
    whatKo:
      '세 장을 한꺼번에 내고 네 장을 모두 가져가요. 다른 플레이어들이 피를 한 장씩 주고요. 한 턴에 카드 세 장을 다 썼기 때문에, 다음 두 턴은 손패 없이 더미만 뒤집어요.',
    exampleEn:
      'You hold three Augusts and the fourth August is on the floor. Play all three and take all four.',
    exampleKo:
      '8월 카드 3장을 들고 있고, 마지막 8월이 바닥에 있어요. 세 장을 모두 내고 네 장을 가져가요.',
    steps: POKDAN_STEPS,
  },
  {
    id: 'sweep',
    nameEn: 'Sweep',
    nameKo: '싹쓸이',
    badgeEn: 'Take 1 junk from each',
    badgeKo: '상대 한 명당 피 1장씩',
    whenEn: 'Your turn takes the last card off the floor, leaving it empty.',
    whenKo: '내 차례에 바닥의 마지막 카드를 가져가서 바닥이 텅 비어요.',
    whatEn: "Each player gives you 1 junk. It doesn't count on the last turn of the hand.",
    whatKo: '다른 플레이어들이 피를 한 장씩 줘요. 단, 그 판의 마지막 턴에는 적용되지 않아요.',
    exampleEn:
      'Only a June card is left on the floor. You play a June and take it. The floor is empty.',
    exampleKo: '바닥에 6월 카드 한 장만 남아있어요. 6월을 내서 가져가면 바닥이 텅 비어요.',
    steps: SWEEP_STEPS,
  },
];

const STUCK_RULE: RuleCopy = {
  id: 'ppeok',
  nameEn: 'Ppeok',
  nameKo: '뻑',
  badgeEn: 'Stuck',
  badgeKo: '묶임',
  neutralBadge: true,
  whenEn: 'You match a floor card with your hand card, then your flip is the same month.',
  whenKo: '손패로 바닥의 카드를 맞춰 가져가려는 순간, 뒤집은 카드도 같은 월이에요.',
  whatEn:
    'You take nothing. All three cards stay stacked on the floor. Whoever plays the fourth card of that month takes the whole stack, plus 1 junk from each player. This is true even if they made the stack themselves.',
  whatKo:
    '아무것도 가져가지 못해요. 세 장 모두 바닥에 그대로 쌓여요. 나중에 그 달의 네 번째 카드를 내는 사람이 쌓인 카드를 전부 가져가고, 다른 플레이어들에게 피도 한 장씩 받아요. 자기가 쌓았더라도 마찬가지예요.',
  exampleEn:
    'Mina plays a January onto a January and flips a third January. The stack is stuck. Later, Joon plays the last January and takes all four, plus 1 junk from each player.',
  exampleKo:
    '미나가 1월 카드를 바닥의 1월에 내고, 뒤집은 카드도 1월이에요. 세 장이 그대로 묶여요. 나중에 준이 마지막 1월을 내서 네 장을 모두 가져가고, 다른 사람들에게 피도 한 장씩 받아요.',
  steps: PPEOK_STEPS,
};

const SHAKE_CARDS = ['01-gwang', '01-tti', '01-pi-1'];

/* -------------------------------------------------------------------------- */
/* Small building blocks                                                      */
/* -------------------------------------------------------------------------- */

function GroupLabel({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="mt-14 mb-4 flex items-center gap-2 text-label font-semibold text-ink first:mt-0"
    >
      <span aria-hidden className="shrink-0 text-ink">
        {icon}
      </span>
      {title}
    </motion.p>
  );
}

function Badge({ children, neutral }: { children: ReactNode; neutral?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-label font-bold whitespace-nowrap ${
        neutral ? 'bg-ink text-surface' : 'bg-plum text-surface'
      }`}
    >
      {children}
    </span>
  );
}

function StaticCard({ id, role, roleKo }: { id: string; role: string; roleKo: string }) {
  const { locale } = useLocale();
  const card = cardById(id);
  if (!card) return null;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative aspect-[2/3] w-14 sm:w-16">
        <HwatuCardImage card={card} className="absolute inset-0 w-full h-full" />
      </div>
      <span className="text-label text-ink-soft">{locale === 'ko' ? roleKo : role}</span>
    </div>
  );
}

/* A single rule card: name/badge, then When / What happens / [Trade-off] / Example,
 * then either the animated step-through (moved from Section 03) or a static card row
 * (Shake only — the preview couldn't show its animation). */
function RuleCard({ rule, children }: { rule: Omit<RuleCopy, 'steps'>; children: ReactNode }) {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  const rows: { termEn: string; termKo: string; en: string; ko: string }[] = [
    { termEn: 'When', termKo: '상황', en: rule.whenEn, ko: rule.whenKo },
    { termEn: 'What happens', termKo: '일어나는 일', en: rule.whatEn, ko: rule.whatKo },
    ...(rule.tradeoffEn && rule.tradeoffKo
      ? [{ termEn: 'Trade-off', termKo: '대가', en: rule.tradeoffEn, ko: rule.tradeoffKo }]
      : []),
    { termEn: 'Example', termKo: '예시', en: rule.exampleEn, ko: rule.exampleKo },
  ];
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="club-card p-6"
    >
      <h4 className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
        <span className="font-display text-sub">{ko ? rule.nameKo : rule.nameEn}</span>
        <span className="text-label text-ink-soft">{ko ? rule.nameEn : rule.nameKo}</span>
        <Badge neutral={rule.neutralBadge}>{ko ? rule.badgeKo : rule.badgeEn}</Badge>
      </h4>
      <dl className="mt-4 grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-x-5 gap-y-1.5 sm:gap-y-2.5 max-w-[65ch]">
        {rows.map((row) => (
          <div key={row.termEn} className="contents">
            <dt className="text-body font-bold sm:pt-0">{ko ? row.termKo : row.termEn}</dt>
            <dd className="mb-2 text-body text-ink-soft sm:mb-0">{ko ? row.ko : row.en}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5">{children}</div>
    </motion.article>
  );
}

/* -------------------------------------------------------------------------- */
/* Bak system                                                                  */
/* -------------------------------------------------------------------------- */

function BakBlock() {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  const rules = bakRules();
  const threshold = (id: 'pi' | 'gwang' | 'meong') => rules.find((r) => r.id === id)?.threshold;

  const items: {
    id: 'pi' | 'gwang' | 'meong';
    titleEn: string;
    titleKo: string;
    descEn: string;
    descKo: string;
  }[] = [
    {
      id: 'pi',
      titleEn: 'Pi-bak',
      titleKo: '피박',
      descEn: `The winner scored with junk, and you have fewer than ${threshold('pi')} junk.`,
      descKo: `승자가 피로 점수를 냈는데, 내 피가 ${threshold('pi')}장 미만이에요.`,
    },
    {
      id: 'gwang',
      titleEn: 'Gwang-bak',
      titleKo: '광박',
      descEn: 'The winner scored with Brights, and you have no Brights.',
      descKo: '승자가 광으로 점수를 냈는데, 나에게 광이 한 장도 없어요.',
    },
    {
      id: 'meong',
      titleEn: 'Meong-bak',
      titleKo: '멍박',
      descEn: `The winner scored with ${SCORING.animalsStartAt}+ Animals, and you have no Animals.`,
      descKo: `승자가 열 ${SCORING.animalsStartAt}장 이상으로 점수를 냈는데, 나에게 열이 한 장도 없어요.`,
    },
  ];

  return (
    <div>
      {!RULES.bakPenalties.enabled && (
        <p className="mb-5 max-w-[65ch] text-body leading-relaxed text-ink-soft">
          {ko
            ? '우리 테이블에서는 박을 쓰지 않아요. 쓰는 테이블도 있으니 방식을 알아두세요.'
            : 'Bak is off at our table. Some tables play it, so here is how it works.'}
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {items.map((item, i) => {
          const on = rules.find((r) => r.id === item.id)?.on ?? false;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
              className="club-card p-5"
            >
              <div className="mb-3">
                <Badge neutral={!on}>
                  {on
                    ? ko
                      ? `패자 부담 ×${BAK_FACTOR}`
                      : `Loser pays ×${BAK_FACTOR}`
                    : ko
                      ? '우리는 안 써요'
                      : 'Off at our table'}
                </Badge>
              </div>
              <h4 className="mb-2 font-display text-sub">
                {ko ? item.titleKo : item.titleEn}
                <span className="ml-2 text-label font-normal text-ink-soft">
                  {ko ? item.titleEn : item.titleKo}
                </span>
              </h4>
              <p className="text-body leading-relaxed text-ink-soft">
                {ko ? item.descKo : item.descEn}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main section                                                                */
/* -------------------------------------------------------------------------- */

export function SectionSpecial() {
  const { locale } = useLocale();
  const ko = locale === 'ko';

  return (
    <section
      id="section-special"
      className="relative py-24 border-t border-hairline section-special-bg"
    >
      <div className="lg:ml-72">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-16">
          <SectionTitle section={SECTION} />
          <FadeInOnView
            as="p"
            delay={0.12}
            className="text-body text-ink-soft max-w-2xl leading-relaxed mb-12"
          >
            {ko
              ? '한 턴 안에서 일어나는 특수한 움직임들, 그리고 최종 점수를 바꾸는 두 가지 규칙.'
              : 'Extra moves that happen during a turn, plus two rules that change the final score.'}
          </FadeInOnView>

          <GroupLabel
            icon={<Plus className="size-4" />}
            title="Take junk from other players · 피 뺏기"
          />
          <p className="mb-6 max-w-[65ch] text-body text-ink-soft leading-relaxed">
            {ko
              ? '이 움직임 중 하나를 성공시키면, 다른 모든 플레이어가 피 한 장씩을 나에게 줘요. 피가 많아질수록 10장을 더 빨리 채우고, 피 10장은 1점이에요.'
              : 'When you pull off one of these moves, every other player hands you one junk card from their pile. More junk gets you to 10 junk faster, and 10 junk = 1 point.'}
          </p>
          <div className="space-y-6">
            {TAKE_JUNK_RULES.map((rule) => (
              <RuleCard key={rule.id} rule={rule}>
                <StepThrough steps={rule.steps} topClassName="mt-6" />
              </RuleCard>
            ))}
          </div>

          <GroupLabel icon={<Lock className="size-4" />} title="Cards that get stuck · 뻑" />
          <RuleCard rule={STUCK_RULE}>
            <StepThrough steps={STUCK_RULE.steps} topClassName="mt-6" />
          </RuleCard>

          <GroupLabel icon={<Zap className="size-4" />} title="Double your score · 흔들기" />
          <RuleCard
            rule={{
              id: 'shake',
              nameEn: 'Shake',
              nameKo: `흔들기 (heundeulgi)`,
              badgeEn: `Score ×${RULES.shakeMultiplier} if you win`,
              badgeKo: `이기면 점수 ×${RULES.shakeMultiplier}`,
              whenEn: 'At the start of the hand, you hold three cards of the same month.',
              whenKo: '패를 받았을 때 같은 달 카드 3장을 손에 들고 있어요.',
              whatEn:
                'Before you play one of them, show all three to the table and say "shake." Then play normally. If you win the hand, your final score doubles. Two shakes make ×4. If you don\'t win, nothing happens.',
              whatKo:
                '그중 한 장을 내기 전에 세 장을 모두 보여주고 "흔들었다"고 말해요. 그다음엔 평소처럼 진행해요. 그 판에서 이기면 최종 점수가 2배가 돼요. 두 번 흔들면 4배. 못 이기면 아무 일도 없어요.',
              tradeoffEn: 'Everyone now knows three of your cards.',
              tradeoffKo: '대신 다른 사람들이 내 카드 세 장을 알게 돼요.',
              exampleEn:
                'You win with 5 points after one shake. Each opponent pays you 10 chips instead of 5.',
              exampleKo: '한 번 흔들고 5점으로 이기면, 상대는 5칩이 아니라 10칩씩 내요.',
            }}
          >
            <div className="flex items-center gap-3 flex-wrap">
              {SHAKE_CARDS.map((id) => (
                <StaticCard key={id} id={id} role="Shown" roleKo="공개" />
              ))}
            </div>
          </RuleCard>

          <GroupLabel
            icon={<AlertTriangle className="size-4" />}
            title="Penalties (off at our table) · 박"
          />
          <BakBlock />
        </div>
      </div>
    </section>
  );
}
