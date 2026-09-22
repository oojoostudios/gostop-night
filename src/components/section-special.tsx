'use client';

import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Sparkles, AlertTriangle, Zap, X } from 'lucide-react';
import { useLocale } from '@/contexts/locale-context';
import { FadeInOnView } from '@/components/fade-in-on-view';
import { SectionTitle } from '@/components/section-title';
import { HwatuCardImage } from '@/components/hwatu-card-image';
import { GOSTOP_SECTIONS } from '@/lib/sections';
import { HWATU_DECK } from '@/lib/hwatu';
import { RULES, SCORING, bakRules } from '@/config/rules';

const SECTION = GOSTOP_SECTIONS.find((s) => s.id === 'section-special')!;

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
          <SectionTitle section={SECTION} />
          <FadeInOnView
            as="p"
            delay={0.12}
            className="text-body text-ink-soft max-w-2xl leading-relaxed mb-12"
          >
            {locale === 'ko'
              ? '고스톱이 단순히 카드 매칭이 아닌 이유. 보너스 피를 부르는 콤보, 카드를 묶어버리는 함정, 점수를 곱해주는 흔들기까지.'
              : "Why go-stop isn't just card matching: bonus moves that earn pi from opponents, stuck-card traps, and shakes that multiply the round's score."}
          </FadeInOnView>

          <SubsectionHeader
            icon={<Sparkles className="size-4" />}
            title={
              locale === 'ko'
                ? '보너스 — 상대 피 한 장씩'
                : 'Bonus moves — gain pi from each opponent'
            }
          />

          <div className="space-y-6 mb-16">
            <Jjok />
            <Ttadak />
            <Pokdan />
          </div>

          <SubsectionHeader
            icon={<X className="size-4" />}
            title={locale === 'ko' ? '꼬임 — 카드가 묶여요' : 'Stuck — cards get tied up'}
          />

          <div className="space-y-6 mb-16">
            <Ppeok />
          </div>

          <SubsectionHeader
            icon={<Zap className="size-4" />}
            title={
              locale === 'ko'
                ? `배수 — 흔들 때마다 ×${RULES.shakeMultiplier}`
                : `Multipliers — ×${RULES.shakeMultiplier} per shake`
            }
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
          />

          <BakBlock />
        </div>
      </div>
    </section>
  );
}

/* Section 05: icons and the small lead dots are always plain `ink`. `plum` is reserved
 * for the "+1 pi" and "×2" badges only (see PiBadge and the shake/bak badges below). */
function SubsectionHeader({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-3 mb-5 text-ink"
    >
      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-ink text-surface">
        {icon}
      </span>
      <h3 className="text-label uppercase tracking-[0.18em] font-semibold">{title}</h3>
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
    <span className="inline-flex items-center gap-1 rounded-full bg-plum px-2.5 py-0.5 text-label font-semibold tabular-nums text-surface">
      +{count} {locale === 'ko' ? '피' : 'pi'}
    </span>
  );
}

function RuleBlock({
  titleKo,
  titleEn,
  badge,
  children,
}: {
  titleKo: string;
  titleEn: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  const { locale } = useLocale();
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
          <span className="size-2.5 shrink-0 rounded-full bg-ink" aria-hidden />
          <h4 className="font-display text-sub">{locale === 'ko' ? titleKo : titleEn}</h4>
        </div>
        <span className="text-label text-ink-soft">{locale === 'ko' ? titleEn : titleKo}</span>
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
    <RuleBlock titleKo="쪽" titleEn="Jjok — match on flip" badge={<PiBadge count={1} />}>
      <p className="text-body text-ink-soft leading-relaxed mb-5 max-w-[65ch]">
        {locale === 'ko'
          ? '내가 낸 손패가 바닥에 짝이 없었지만, 더미에서 뒤집은 카드가 같은 월이었을 때. 두 장 모두 가져가고, 상대 한 명당 피 한 장씩 받아요.'
          : "You played a hand card that didn't match anything on the floor — but the card you flipped from the deck happens to be the same month. Take the pair, plus one pi from each opponent."}
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex flex-col items-center gap-1.5">
          <MiniCard id="01-gwang" />
          <span className="text-label text-ink-soft">{locale === 'ko' ? '내 손패' : 'Hand'}</span>
        </div>
        <span className="text-ink-soft text-body">→</span>
        <div className="flex flex-col items-center gap-1.5">
          <MiniCard id="01-pi-1" />
          <span className="text-label text-ink-soft">
            {locale === 'ko' ? '더미에서 뒤집음' : 'Flipped'}
          </span>
        </div>
        <span className="text-ink-soft text-body">=</span>
        <div className="flex gap-1">
          <MiniCard id="01-gwang" />
          <MiniCard id="01-pi-1" />
        </div>
        <span className="text-label text-ink-soft">
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
      titleEn="Ttadak — same-month double match"
      badge={<PiBadge count={1} />}
    >
      <p className="text-body text-ink-soft leading-relaxed mb-5 max-w-[65ch]">
        {locale === 'ko'
          ? '바닥에 같은 월 카드가 2장 있을 때, 내 손패가 그중 한 장을 가져가고, 이어서 더미에서 뒤집은 카드가 나머지 한 장을 가져가요. 손패·뒤집은 카드·바닥 2장, 4장 모두 내 것이 돼요. 상대 한 명당 피 한 장씩 받아요.'
          : 'When two same-month cards are already on the floor, your hand card takes one of them — then the card you flip from the deck takes the other. Your hand, the flip, and both floor cards: all four end up in your pile. Plus one pi from each opponent.'}
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex flex-col items-start gap-1.5">
          <div className="flex gap-1">
            <MiniCard id="01-pi-1" />
            <MiniCard id="01-pi-2" />
          </div>
          <span className="text-label text-ink-soft">
            {locale === 'ko' ? '바닥에 이미 2장' : 'On floor (2 of January)'}
          </span>
        </div>
        <span className="text-ink-soft text-body">+</span>
        <div className="flex flex-col items-start gap-1.5">
          <MiniCard id="01-gwang" />
          <span className="text-label text-ink-soft">
            {locale === 'ko' ? '내 손패' : 'Your hand'}
          </span>
        </div>
        <span className="text-ink-soft text-body">+</span>
        <div className="flex flex-col items-start gap-1.5">
          <MiniCard id="01-tti" />
          <span className="text-label text-ink-soft">
            {locale === 'ko' ? '더미에서 뒤집음' : 'Flipped'}
          </span>
        </div>
        <span className="text-ink-soft text-body">=</span>
        <span className="text-label text-ink-soft font-semibold">
          {locale === 'ko' ? '4장 모두 내 것' : 'Take all four'}
        </span>
      </div>
    </RuleBlock>
  );
}

function Pokdan() {
  const { locale } = useLocale();
  return (
    <RuleBlock titleKo="폭탄 (3장)" titleEn="Pokdan — 3-card bomb" badge={<PiBadge count={1} />}>
      <p className="text-body text-ink-soft leading-relaxed mb-5 max-w-[65ch]">
        {locale === 'ko'
          ? `내 손에 같은 월 카드가 3장이고 바닥에 그 월의 마지막 1장이 있을 때, 한꺼번에 던져 4장 모두 가져가요. 상대 한 명당 피 한 장씩. ${
              RULES.bombMultiplier > 1
                ? `폭탄을 쓰면 점수가 ${RULES.bombMultiplier}배가 돼요.`
                : '폭탄으로는 점수가 곱해지지 않아요.'
            }`
          : `If you hold three cards of the same month and the fourth is on the floor, drop all three at once and take all four. Plus one pi from each opponent. ${
              RULES.bombMultiplier > 1
                ? `A bomb multiplies the score by ×${RULES.bombMultiplier}.`
                : "A bomb doesn't multiply the score."
            }`}
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex flex-col items-start gap-1.5">
          <div className="flex gap-1">
            <MiniCard id="01-gwang" />
            <MiniCard id="01-tti" />
            <MiniCard id="01-pi-1" />
          </div>
          <span className="text-label text-ink-soft">
            {locale === 'ko' ? '내 손패 (1월 3장)' : 'Hand (3× January)'}
          </span>
        </div>
        <span className="text-ink-soft text-body">+</span>
        <div className="flex flex-col items-start gap-1.5">
          <MiniCard id="01-pi-2" />
          <span className="text-label text-ink-soft">
            {locale === 'ko' ? '바닥의 마지막 1월' : "Floor's 4th January"}
          </span>
        </div>
        <span className="text-ink-soft text-body">=</span>
        <span className="text-label text-ink-soft font-semibold">
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
    <RuleBlock titleKo="뻑" titleEn="Ppeok — flip locks the floor">
      <p className="text-body text-ink-soft leading-relaxed mb-5 max-w-[65ch]">
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
          <span className="text-label text-ink font-semibold">
            {locale === 'ko' ? '1월 3장이 바닥에 묶임' : '3 January cards stuck on floor'}
          </span>
        </div>
        <span className="text-ink-soft text-body">→</span>
        <span className="text-label text-ink-soft">
          {locale === 'ko'
            ? '다음에 1월 내는 사람이 4장 한꺼번에 가져감'
            : 'Next player to play a January card sweeps all 4'}
        </span>
      </div>
      <p className="text-label text-ink-soft mt-3 max-w-[65ch]">
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
        <span className="text-label font-bold tabular-nums px-2.5 py-0.5 rounded-full bg-plum text-surface">
          ×{RULES.shakeMultiplier}
        </span>
      }
    >
      <p className="text-body text-ink-soft leading-relaxed mb-5 max-w-[65ch]">
        {locale === 'ko'
          ? `처음 패를 받았을 때 내 손에 같은 월 카드가 3장 있으면, '흔들었다'고 선언할 수 있어요. 흔들 때마다 그 라운드의 점수가 ${RULES.shakeMultiplier}배가 돼요.`
          : `If your starting hand contains three cards of the same month, you can declare 'shake' — the round's score is multiplied by ×${RULES.shakeMultiplier} for each shake.`}
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex flex-col items-start gap-1.5">
          <div className="flex gap-1">
            <MiniCard id="01-gwang" />
            <MiniCard id="01-tti" />
            <MiniCard id="01-pi-1" />
          </div>
          <span className="text-label text-ink-soft">
            {locale === 'ko' ? '내 손에 1월 3장' : 'Three January cards in starting hand'}
          </span>
        </div>
        <span className="text-ink-soft text-body">→</span>
        <span className="text-label font-semibold text-ink">
          {locale === 'ko'
            ? `라운드 점수 ×${RULES.shakeMultiplier}`
            : `Round score ×${RULES.shakeMultiplier}`}
        </span>
      </div>
      <p className="text-label text-ink-soft mt-3 max-w-[65ch]">
        {locale === 'ko'
          ? `* 흔들 때마다 점수가 다시 ${RULES.shakeMultiplier}배가 돼요. 두 번 흔들면 ${
              RULES.shakeMultiplier ** 2
            }배.`
          : `* Every shake multiplies the score again: two shakes make ×${RULES.shakeMultiplier ** 2}.`}
      </p>
    </RuleBlock>
  );
}

/* -------------------------------------------------------------------------- */
/* Bak system                                                                  */
/* -------------------------------------------------------------------------- */

function BakBlock() {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  // Which bak rules apply at our table, and their thresholds (src/config/rules.ts).
  const rules = bakRules();
  const threshold = (id: 'pi' | 'gwang' | 'meong') => rules.find((r) => r.id === id)?.threshold;

  const items: {
    id: 'pi' | 'gwang' | 'meong';
    titleKo: string;
    titleEn: string;
    descKo: string;
    descEn: string;
  }[] = [
    {
      id: 'pi',
      titleKo: '피박 (Pi-bak)',
      titleEn: 'Pi-bak',
      descKo: `내가 스톱했을 때 누군가 피가 ${threshold('pi')}장 미만이면, 그 사람의 부담이 2배.`,
      descEn: `If you stop while an opponent has fewer than ${threshold('pi')} junk, their payment doubles.`,
    },
    {
      id: 'gwang',
      titleKo: '광박 (Gwang-bak)',
      titleEn: 'Gwang-bak',
      descKo: '내가 광 점수를 올렸는데 누군가 광이 0장이면, 그 사람의 부담이 2배.',
      descEn: 'If you score with brights but an opponent has zero brights, their payment doubles.',
    },
    {
      id: 'meong',
      titleKo: '멍박 (Meong-bak)',
      titleEn: 'Meong-bak',
      descKo: `내가 열 점수를 올렸는데 누군가 열이 ${SCORING.animalsStartAt}장 미만이면, 그 사람의 부담이 2배.`,
      descEn: `If you score with animals but an opponent has fewer than ${SCORING.animalsStartAt} animals, their payment doubles.`,
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
              {/* On: the ×2 badge in plum. Off: a plain "off" label. */}
              <span
                className={`mb-3 inline-block rounded-full px-2.5 py-0.5 text-label font-bold tabular-nums ${
                  on ? 'bg-plum text-surface' : 'bg-ink/10 text-ink'
                }`}
              >
                {on ? '×2' : ko ? '우리는 안 써요' : 'Off at our table'}
              </span>
              <h4 className="mb-2 font-display text-sub">{ko ? item.titleKo : item.titleEn}</h4>
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
