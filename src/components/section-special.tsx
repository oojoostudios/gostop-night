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
import { MonthCaption, StepThrough, type Step } from '@/components/turn-stage';

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
    title: 'Nothing to match.',
    titleKo: '매치할 게 없어요.',
    desc: "You hold the January Bright. There's no January card on the floor.",
    descKo: '1월 광을 들고 있는데, 바닥엔 1월 카드가 없어요.',
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
    title: 'Play it anyway.',
    titleKo: '그래도 내요.',
    desc: 'The January Bright goes face up on the floor.',
    descKo: '1월 광이 바닥에 앞면으로 놓여요.',
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
    title: 'The flip is January.',
    titleKo: '뒤집은 카드가 1월이에요.',
    desc: "Your flip is a January Junk card, the same month as the card you just played. That's Jjok.",
    descKo: '뒤집은 카드가 1월 피 카드로, 방금 낸 카드와 같은 달이에요. 이게 쪽이에요.',
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
    title: 'Take both, plus 1 junk from each player.',
    titleKo: '둘 다 가져가고, 상대에게 피를 1장씩 받아요.',
    desc: 'Both January cards go to your pile, and every other player gives you one Junk card.',
    descKo: '1월 카드 두 장 모두 내 더미로 가고, 다른 모든 플레이어가 피 카드를 한 장씩 줘요.',
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
    title: 'Two Marches on the floor.',
    titleKo: '바닥에 3월이 두 장.',
    desc: 'Two March Junk cards are on the floor. You hold the March Bright.',
    descKo: '바닥에 3월 피 카드가 두 장 있어요. 내 손엔 3월 광이 있고요.',
    state: {
      hand: TTADAK_HAND_INIT,
      floor: TTADAK_FLOOR_INIT,
      taken: [],
      deckCount: 19,
      highlight: { hand: '03-gwang', floor: ['03-pi-1', '03-pi-2'] },
    },
  },
  {
    id: 'play-one',
    title: 'Play the March Bright.',
    titleKo: '3월 광을 내요.',
    desc: "It matches, but with two Marches there, you'd normally take just one. Wait for the flip.",
    descKo: '맞긴 하지만, 3월이 두 장 있을 땐 원래 한 장만 가져가요. 뒤집을 때까지 기다려요.',
    state: {
      hand: TTADAK_HAND_AFTER,
      floor: ['08-gwang', '03-pi-2'],
      taken: ['03-gwang', '03-pi-1'],
      deckCount: 19,
      highlight: { taken: ['03-gwang', '03-pi-1'], floor: ['03-pi-2'] },
    },
  },
  {
    id: 'flip-ttadak',
    title: 'The flip is the last March.',
    titleKo: '뒤집은 카드가 마지막 3월이에요.',
    desc: "Your flip is the March Ribbon, the fourth March. You take all four March cards. That's Ttadak.",
    descKo:
      '뒤집은 카드가 3월 띠, 네 번째 3월이에요. 3월 카드 네 장을 모두 가져가요. 이게 따닥이에요.',
    state: {
      hand: TTADAK_HAND_AFTER,
      floor: ['08-gwang'],
      taken: ['03-gwang', '03-pi-1', '03-pi-2', '03-tti'],
      deckCount: 18,
      highlight: { taken: ['03-pi-2', '03-tti'] },
    },
  },
  {
    id: 'bonus',
    title: 'Plus 1 junk from each player.',
    titleKo: '상대에게 피를 1장씩 받아요.',
    desc: 'Every other player gives you one Junk card.',
    descKo: '다른 모든 플레이어가 피 카드를 한 장씩 줘요.',
    state: {
      hand: TTADAK_HAND_AFTER,
      floor: ['08-gwang'],
      taken: ['03-gwang', '03-pi-1', '03-pi-2', '03-tti'],
      deckCount: 18,
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
    title: 'Looks like a normal match.',
    titleKo: '평범한 매치처럼 보여요.',
    desc: 'You hold the January Bright, and a January Junk card is on the floor.',
    descKo: '1월 광을 들고 있고, 바닥에 1월 피 카드가 있어요.',
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
    title: 'The flip is January too.',
    titleKo: '뒤집은 카드도 1월이에요.',
    desc: 'Your flip is the January Ribbon. Now three January cards are stacked on the floor.',
    descKo: '뒤집은 카드가 1월 띠예요. 이제 바닥에 1월 카드가 세 장 쌓여요.',
    state: {
      hand: PPEOK_HAND_AFTER,
      floor: [...PPEOK_FLOOR_INIT, '01-gwang'],
      taken: [],
      deckCount: 18,
      flipped: '01-tti',
      highlight: { floor: ['01-pi-1', '01-gwang'] },
    },
  },
  {
    id: 'locked',
    title: 'Stuck.',
    titleKo: '묶여요.',
    desc: 'You take nothing. The three January cards stay stuck on the floor. Whoever plays the fourth January takes all four, plus 1 junk from each player, even if they made the stack.',
    descKo:
      '아무것도 못 가져가요. 1월 카드 세 장이 바닥에 그대로 묶여요. 네 번째 1월을 내는 사람이 네 장을 모두 가져가고, 다른 플레이어들에게 피도 한 장씩 받아요 — 자기가 쌓았어도 마찬가지예요.',
    state: {
      hand: PPEOK_HAND_AFTER,
      floor: ['04-pi-1', '08-gwang', '01-pi-1', '01-gwang', '01-tti'],
      taken: [],
      deckCount: 18,
      highlight: { locked: ['01-pi-1', '01-gwang', '01-tti'] },
    },
  },
];

const SWEEP_HAND_INIT = ['06-kkeut', '07-pi-1', '09-kkeut'];
const SWEEP_HAND_AFTER = ['07-pi-1', '09-kkeut'];
const SWEEP_TAKEN_PRE = ['02-kkeut', '03-gwang', '04-pi-1'];

const SWEEP_STEPS: Step[] = [
  {
    id: 'setup',
    title: 'Two cards left on the floor.',
    titleKo: '바닥에 두 장만 남았어요.',
    desc: 'Late in the hand, only a June Junk card and an October Junk card are left on the floor. You hold a June card.',
    descKo: '판 막바지, 바닥엔 6월 피 카드와 10월 피 카드만 남았어요. 내 손엔 6월 카드가 있고요.',
    state: {
      hand: SWEEP_HAND_INIT,
      floor: ['06-pi-1', '10-pi-1'],
      taken: SWEEP_TAKEN_PRE,
      deckCount: 6,
      highlight: { hand: '06-kkeut', floor: ['06-pi-1'] },
    },
  },
  {
    id: 'play-june',
    title: 'Play June.',
    titleKo: '6월을 내요.',
    desc: 'Your June card takes the June Junk card. One card is left.',
    descKo: '내 6월 카드가 6월 피 카드를 가져가요. 한 장 남았어요.',
    state: {
      hand: SWEEP_HAND_AFTER,
      floor: ['10-pi-1'],
      taken: [...SWEEP_TAKEN_PRE, '06-kkeut', '06-pi-1'],
      deckCount: 6,
      highlight: { taken: ['06-kkeut', '06-pi-1'] },
    },
  },
  {
    id: 'sweep',
    title: 'The flip is October.',
    titleKo: '뒤집은 카드가 10월이에요.',
    desc: "Your flip is an October card, and it takes the last floor card. The floor is empty. That's Sweep: each player gives you 1 junk.",
    descKo:
      '뒤집은 카드가 10월 카드인데, 이게 바닥의 마지막 카드를 가져가요. 바닥이 텅 비어요. 이게 싹쓸이 — 상대가 피를 1장씩 줘요.',
    state: {
      hand: SWEEP_HAND_AFTER,
      floor: [],
      taken: [...SWEEP_TAKEN_PRE, '06-kkeut', '06-pi-1', '10-pi-1', '10-pi-2'],
      deckCount: 5,
      highlight: { taken: ['10-pi-1', '10-pi-2'] },
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
    title: 'Three Augusts in hand.',
    titleKo: '손에 8월 카드가 세 장.',
    desc: 'You hold the August Bright, the August Animal (geese), and an August Junk card. The last August Junk card is on the floor.',
    descKo:
      '8월 광, 8월 열(기러기), 8월 피 카드를 들고 있어요. 마지막 8월 피 카드는 바닥에 있고요.',
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
    title: 'Play all three at once.',
    titleKo: '세 장을 한꺼번에 내요.',
    desc: 'Put all three down together and take all four August cards. Each player gives you 1 junk.',
    descKo:
      '세 장을 한 번에 내려놓고 8월 카드 네 장을 모두 가져가요. 다른 플레이어들이 피를 한 장씩 줘요.',
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
    title: 'Flip as usual.',
    titleKo: '평소처럼 뒤집어요.',
    desc: 'You still flip from the deck. This one matches nothing and stays on the floor. On your next two turns, you only flip.',
    descKo:
      '그래도 더미에서 한 장 뒤집어요. 이번엔 아무것도 안 맞아서 바닥에 남아요. 다음 두 턴은 뒤집기만 해요.',
    state: {
      hand: POKDAN_HAND_AFTER,
      floor: ['01-pi-1', '04-pi-1', '05-pi-1'],
      taken: ['08-gwang', '08-kkeut', '08-pi-1', '08-pi-2'],
      deckCount: 18,
      flipped: '05-pi-1',
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
      <MonthCaption card={card} />
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
