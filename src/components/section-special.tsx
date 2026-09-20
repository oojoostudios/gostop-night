'use client';

import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Sparkles, AlertTriangle, Zap, X } from 'lucide-react';
import { useLocale } from '@/contexts/locale-context';
import { FadeInOnView } from '@/components/fade-in-on-view';
import { HwatuCardImage } from '@/components/hwatu-card-image';
import { HWATU_DECK } from '@/lib/hwatu';

const cardById = (id: string) => HWATU_DECK.find((c) => c.id === id);

export function SectionSpecial() {
  const { locale } = useLocale();

  return (
    <section
      id="section-special"
      className="relative py-24 border-t border-hairline section-special-bg"
    >
      <div className="lg:ml-72">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-16">
          <FadeInOnView
            as="h2"
            delay={0.05}
            className="font-display text-4xl md:text-5xl leading-tight mb-6"
          >
            <span className="text-plum">05</span>
            <span className="ml-4">{locale === 'ko' ? '특수 룰' : 'Special rules'}</span>
          </FadeInOnView>
          <FadeInOnView
            as="p"
            delay={0.12}
            className="text-lg text-ink-soft max-w-2xl leading-relaxed mb-12"
          >
            {locale === 'ko'
              ? '고스톱이 단순히 카드 매칭이 아닌 이유. 보너스 피를 부르는 콤보, 카드를 묶어버리는 함정, 점수를 두 배로 만드는 배수까지.'
              : "Why go-stop isn't just card matching: bonus moves that earn pi from opponents, stuck-card traps, and multipliers that double the round."}
          </FadeInOnView>

          <SubsectionHeader
            icon={<Sparkles className="size-4" />}
            title={
              locale === 'ko'
                ? '보너스 — 상대 피 한 장씩'
                : 'Bonus moves — gain pi from each opponent'
            }
            accent="sage"
          />

          <div className="space-y-6 mb-16">
            <Jjok />
            <Ttadak />
            <Pokdan />
          </div>

          <SubsectionHeader
            icon={<X className="size-4" />}
            title={locale === 'ko' ? '꼬임 — 카드가 묶여요' : 'Stuck — cards get tied up'}
            accent="gold"
          />

          <div className="space-y-6 mb-16">
            <Ppeok />
          </div>

          <SubsectionHeader
            icon={<Zap className="size-4" />}
            title={locale === 'ko' ? '배수 — 점수가 두 배로' : 'Multipliers — score doubles'}
            accent="ink"
          />

          <div className="space-y-6 mb-16">
            <Heunduki />
          </div>

          <SubsectionHeader
            icon={<AlertTriangle className="size-4" />}
            title={
              locale === 'ko'
                ? '박 시스템 — 패자에게 추가 부담'
                : 'Bak system — penalties for the loser'
            }
            accent="plum"
          />

          <BakBlock />
        </div>
      </div>
    </section>
  );
}

/* Each accent is a fill token chosen by MEANING: sage = gain, gold = warning/trap,
 * ink = multiplier, plum = penalty. `onFill` is the label color that stays readable on it. */
const ACCENT = {
  sage: { fill: 'bg-sage', onFill: 'text-on-fill' },
  gold: { fill: 'bg-gold', onFill: 'text-on-fill' },
  ink: { fill: 'bg-ink', onFill: 'text-surface' },
  plum: { fill: 'bg-plum', onFill: 'text-surface' },
} as const;

type Accent = keyof typeof ACCENT;

function SubsectionHeader({
  icon,
  title,
  accent,
}: {
  icon: ReactNode;
  title: string;
  accent: Accent;
}) {
  const a = ACCENT[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-3 mb-5 text-ink"
    >
      <span
        className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full ${a.fill} ${a.onFill}`}
      >
        {icon}
      </span>
      <h3 className="text-sm uppercase tracking-[0.18em] font-semibold">{title}</h3>
    </motion.div>
  );
}

function MiniCard({ id, faded }: { id: string; faded?: boolean }) {
  const card = cardById(id);
  if (!card) return null;
  return (
    <div
      className={`relative aspect-[2/3] w-12 sm:w-14 shrink-0 ${
        faded ? 'opacity-40 grayscale-[40%]' : ''
      }`}
    >
      <HwatuCardImage card={card} className="absolute inset-0 w-full h-full" />
    </div>
  );
}

function PiBadge({ count }: { count: number }) {
  const { locale } = useLocale();
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold tabular-nums px-2.5 py-0.5 rounded-full bg-sage/25 text-ink">
      +{count} {locale === 'ko' ? '피' : 'pi'}
    </span>
  );
}

function RuleBlock({
  titleKo,
  titleEn,
  badge,
  accent,
  children,
}: {
  titleKo: string;
  titleEn: string;
  badge?: ReactNode;
  accent: Accent;
  children: ReactNode;
}) {
  const { locale } = useLocale();
  const a = ACCENT[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="club-card p-6"
    >
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <span className={`size-2.5 shrink-0 rounded-full ${a.fill}`} aria-hidden />
          <h4 className="font-display text-xl">{locale === 'ko' ? titleKo : titleEn}</h4>
        </div>
        <span className="text-xs text-ink-soft">{locale === 'ko' ? titleEn : titleKo}</span>
        {badge}
      </div>
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Bonus moves                                                                 */
/* -------------------------------------------------------------------------- */

function Jjok() {
  const { locale } = useLocale();
  return (
    <RuleBlock
      titleKo="쪽"
      titleEn="Jjok — match on flip"
      badge={<PiBadge count={1} />}
      accent="sage"
    >
      <p className="text-sm text-ink-soft leading-relaxed mb-5 max-w-[65ch]">
        {locale === 'ko'
          ? '내가 낸 손패가 바닥에 짝이 없었지만, 더미에서 뒤집은 카드가 같은 월이었을 때. 두 장 모두 가져가고, 상대 한 명당 피 한 장씩 받아요.'
          : "You played a hand card that didn't match anything on the floor — but the card you flipped from the deck happens to be the same month. Take the pair, plus one pi from each opponent."}
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex flex-col items-center gap-1.5">
          <MiniCard id="01-gwang" />
          <span className="text-xs text-ink-soft">{locale === 'ko' ? '내 손패' : 'Hand'}</span>
        </div>
        <span className="text-ink-soft text-lg">→</span>
        <div className="flex flex-col items-center gap-1.5">
          <MiniCard id="01-pi-1" />
          <span className="text-xs text-ink-soft">
            {locale === 'ko' ? '더미에서 뒤집음' : 'Flipped'}
          </span>
        </div>
        <span className="text-ink-soft text-lg">=</span>
        <div className="flex gap-1">
          <MiniCard id="01-gwang" />
          <MiniCard id="01-pi-1" />
        </div>
        <span className="text-xs text-ink-soft">
          {locale === 'ko' ? '둘 다 내 것' : 'Both taken'}
        </span>
      </div>
    </RuleBlock>
  );
}

function Ttadak() {
  const { locale } = useLocale();
  return (
    <RuleBlock
      titleKo="따닥"
      titleEn="Ttadak — same-month triple match"
      badge={<PiBadge count={1} />}
      accent="sage"
    >
      <p className="text-sm text-ink-soft leading-relaxed mb-5 max-w-[65ch]">
        {locale === 'ko'
          ? '바닥에 같은 월 카드가 2장 있을 때, 내 손패가 그 월과 같으면 3장 모두 가져가요. 상대 한 명당 피 한 장씩 받아요.'
          : 'When two same-month cards are already on the floor and your hand card matches them, you take all three. Plus one pi from each opponent.'}
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex flex-col items-start gap-1.5">
          <div className="flex gap-1">
            <MiniCard id="01-pi-1" />
            <MiniCard id="01-pi-2" />
          </div>
          <span className="text-xs text-ink-soft">
            {locale === 'ko' ? '바닥에 이미 2장' : 'On floor (2 of January)'}
          </span>
        </div>
        <span className="text-ink-soft text-lg">+</span>
        <div className="flex flex-col items-start gap-1.5">
          <MiniCard id="01-gwang" />
          <span className="text-xs text-ink-soft">{locale === 'ko' ? '내 손패' : 'Your hand'}</span>
        </div>
        <span className="text-ink-soft text-lg">=</span>
        <span className="text-xs text-ink-soft font-semibold">
          {locale === 'ko' ? '3장 모두 내 것' : 'Take all three'}
        </span>
      </div>
    </RuleBlock>
  );
}

function Pokdan() {
  const { locale } = useLocale();
  return (
    <RuleBlock
      titleKo="폭탄 (3장)"
      titleEn="Pokdan — 3-card bomb"
      badge={<PiBadge count={1} />}
      accent="sage"
    >
      <p className="text-sm text-ink-soft leading-relaxed mb-5 max-w-[65ch]">
        {locale === 'ko'
          ? '내 손에 같은 월 카드가 3장이고 바닥에 그 월의 마지막 1장이 있을 때, 한꺼번에 던져 4장 모두 가져가요. 상대 한 명당 피 한 장씩.'
          : 'If you hold three cards of the same month and the fourth is on the floor, drop all three at once and take all four. Plus one pi from each opponent.'}
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex flex-col items-start gap-1.5">
          <div className="flex gap-1">
            <MiniCard id="01-gwang" />
            <MiniCard id="01-tti" />
            <MiniCard id="01-pi-1" />
          </div>
          <span className="text-xs text-ink-soft">
            {locale === 'ko' ? '내 손패 (1월 3장)' : 'Hand (3× January)'}
          </span>
        </div>
        <span className="text-ink-soft text-lg">+</span>
        <div className="flex flex-col items-start gap-1.5">
          <MiniCard id="01-pi-2" />
          <span className="text-xs text-ink-soft">
            {locale === 'ko' ? '바닥의 마지막 1월' : "Floor's 4th January"}
          </span>
        </div>
        <span className="text-ink-soft text-lg">=</span>
        <span className="text-xs text-ink-soft font-semibold">
          {locale === 'ko' ? '4장 모두 내 것' : 'Take all four'}
        </span>
      </div>
    </RuleBlock>
  );
}

/* -------------------------------------------------------------------------- */
/* Stuck                                                                       */
/* -------------------------------------------------------------------------- */

function Ppeok() {
  const { locale } = useLocale();
  return (
    <RuleBlock titleKo="뻑" titleEn="Ppeok — flip locks the floor" accent="gold">
      <p className="text-sm text-ink-soft leading-relaxed mb-5 max-w-[65ch]">
        {locale === 'ko'
          ? '내가 낸 손패가 바닥에 짝이 있어 가져가려는 순간, 더미에서 뒤집은 카드도 같은 월이면 — 카드 3장이 한꺼번에 묶여 바닥에 그대로 놓여요. 다음에 그 월을 내는 사람이 모두 가져가요.'
          : 'You play a hand card that matches a floor card. But the card you flip is also the same month — all three cards stay locked on the floor. The next player to play that month takes everything.'}
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex flex-col items-start gap-1.5">
          <div className="flex gap-1">
            <MiniCard id="01-gwang" />
            <MiniCard id="01-tti" />
            <MiniCard id="01-pi-1" />
          </div>
          <span className="text-xs text-ink font-semibold">
            {locale === 'ko' ? '1월 3장이 바닥에 묶임' : '3 January cards stuck on floor'}
          </span>
        </div>
        <span className="text-ink-soft text-lg">→</span>
        <span className="text-xs text-ink-soft">
          {locale === 'ko'
            ? '다음에 1월 내는 사람이 4장 한꺼번에 가져감'
            : 'Next player to play a January card sweeps all 4'}
        </span>
      </div>
      <p className="text-xs text-ink-soft mt-3 max-w-[65ch]">
        {locale === 'ko'
          ? '* 자뻑 — 자기 차례에 내가 낸 손패와 뒤집은 카드가 같은 월이면 그 두 장이 묶여요.'
          : '* 자뻑 (self-ppeok): your own play + flip both being the same month also creates this lock.'}
      </p>
    </RuleBlock>
  );
}

/* -------------------------------------------------------------------------- */
/* Multiplier                                                                  */
/* -------------------------------------------------------------------------- */

function Heunduki() {
  const { locale } = useLocale();
  return (
    <RuleBlock
      titleKo="흔들기"
      titleEn="Heunduki — declared shake"
      badge={
        <span className="text-xs font-bold tabular-nums px-2.5 py-0.5 rounded-full bg-ink text-surface">
          ×2
        </span>
      }
      accent="ink"
    >
      <p className="text-sm text-ink-soft leading-relaxed mb-5 max-w-[65ch]">
        {locale === 'ko'
          ? "처음 패를 받았을 때 내 손에 같은 월 카드가 3장 있으면, '흔들었다'고 선언할 수 있어요. 그 라운드의 점수가 2배가 돼요."
          : "If your starting hand contains three cards of the same month, you can declare 'shake' — the round's score doubles."}
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex flex-col items-start gap-1.5">
          <div className="flex gap-1">
            <MiniCard id="01-gwang" />
            <MiniCard id="01-tti" />
            <MiniCard id="01-pi-1" />
          </div>
          <span className="text-xs text-ink-soft">
            {locale === 'ko' ? '내 손에 1월 3장' : 'Three January cards in starting hand'}
          </span>
        </div>
        <span className="text-ink-soft text-lg">→</span>
        <span className="text-xs font-semibold text-ink">
          {locale === 'ko' ? '라운드 점수 ×2' : 'Round score ×2'}
        </span>
      </div>
      <p className="text-xs text-ink-soft mt-3 max-w-[65ch]">
        {locale === 'ko'
          ? "* 4장이면 '폭탄 흔들기' — ×2가 누적될 수도 있어요 (룰셋에 따라 다름)."
          : '* Four-of-a-month is sometimes called bomb-shake — multipliers may stack depending on local rules.'}
      </p>
    </RuleBlock>
  );
}

/* -------------------------------------------------------------------------- */
/* Bak system                                                                  */
/* -------------------------------------------------------------------------- */

function BakBlock() {
  const { locale } = useLocale();
  const items: {
    titleKo: string;
    titleEn: string;
    descKo: string;
    descEn: string;
  }[] = [
    {
      titleKo: '피박 (Pi-bak)',
      titleEn: 'Pi-bak',
      descKo: '내가 스톱했을 때 누군가 피가 7장 미만이면, 그 사람의 부담이 2배.',
      descEn: 'If you stop while an opponent has fewer than 7 pi, their payment doubles.',
    },
    {
      titleKo: '광박 (Gwang-bak)',
      titleEn: 'Gwang-bak',
      descKo: '내가 광 점수를 올렸는데 누군가 광이 0장이면, 그 사람의 부담이 2배.',
      descEn: 'If you score with brights but an opponent has zero brights, their payment doubles.',
    },
    {
      titleKo: '멍박 (Meong-bak)',
      titleEn: 'Meong-bak',
      descKo: '내가 열 점수를 올렸는데 누군가 열이 5장 미만이면, 그 사람의 부담이 2배.',
      descEn:
        'If you score with animals but an opponent has fewer than 5 animals, their payment doubles.',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item, i) => (
        <motion.div
          key={item.titleKo}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1],
            delay: i * 0.08,
          }}
          className="club-card p-5"
        >
          <span
            className={`inline-block text-xs font-bold tabular-nums px-2.5 py-0.5 rounded-full mb-3 ${ACCENT.plum.fill} ${ACCENT.plum.onFill}`}
          >
            ×2
          </span>
          <h4 className="font-display text-xl mb-2">
            {locale === 'ko' ? item.titleKo : item.titleEn}
          </h4>
          <p className="text-sm text-ink-soft leading-relaxed">
            {locale === 'ko' ? item.descKo : item.descEn}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
