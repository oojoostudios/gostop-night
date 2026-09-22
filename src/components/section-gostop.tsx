'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Zap } from 'lucide-react';
import { useLocale } from '@/contexts/locale-context';
import { FadeInOnView } from '@/components/fade-in-on-view';
import { SectionTitle } from '@/components/section-title';
import { PlayersSwitch } from '@/components/players-switch';
import { usePlayers } from '@/lib/use-players';
import { GOSTOP_SECTIONS } from '@/lib/sections';
import { RULES, callThreshold, goRows, scoreAfterGos, type Players } from '@/config/rules';

const SECTION = GOSTOP_SECTIONS.find((s) => s.id === 'section-gostop')!;

type Choice = 'stop' | 'go';
type Lang = 'en' | 'ko';

/* -------------------------------------------------------------------------- */
/* Rules text. Every number and every "what happens" below comes from          */
/* src/config/rules.ts, so changing a house rule there changes this section.   */
/* -------------------------------------------------------------------------- */

/** What a player who called Go pays when someone else stops first (the goBak rule). */
function goBakClause(players: Players, lang: Lang): string {
  if (!RULES.goBak) return lang === 'ko' ? '그 판을 져요' : 'you simply lose the round';
  if (players === 3) {
    return lang === 'ko'
      ? '판 전체를 혼자 물어줘요 (고박)'
      : 'you pay for the whole table (Go-bak)';
  }
  return lang === 'ko' ? '두 배로 물어줘요 (고박)' : 'you pay double (Go-bak)';
}

/** How Go adds to the score (the goScoring rule), as one sentence. */
function goScoringLine(lang: Lang): string {
  if (RULES.goScoring === 'flat') {
    return lang === 'ko'
      ? '고를 할 때마다 점수가 1점씩 올라가요.'
      : 'Each Go adds 1 point to your score.';
  }
  return lang === 'ko'
    ? '처음 두 번의 고는 1점씩, 그다음부터는 고할 때마다 점수가 두 배가 돼요.'
    : 'The first two Gos add a point each, then every Go doubles your score.';
}

/** The Go-bak warning as one sentence (empty when the goBak rule is off). */
function goBakLine(players: Players, lang: Lang): string {
  if (!RULES.goBak) return '';
  return lang === 'ko'
    ? `하지만 상대가 먼저 스톱하면 ${goBakClause(players, 'ko')}.`
    : `But if an opponent stops first, ${goBakClause(players, 'en')}.`;
}

/** What happens after a drawn hand (the nagariDoubles rule), as a sentence. */
function nagariLine(lang: Lang): string {
  if (RULES.nagariDoubles) {
    return lang === 'ko'
      ? '아무도 이기지 못하면 나가리, 다음 판 점수가 2배가 돼요.'
      : "If nobody wins the hand (a draw, 나가리), the next hand's score is doubled.";
  }
  return lang === 'ko'
    ? '아무도 이기지 못하면 나가리, 다음 판으로 넘어가요.'
    : 'If nobody wins the hand (a draw, 나가리), play moves on to the next hand.';
}

/** "5 points, 3 Gos → (5 + 2) × 2 = 14 chips from each opponent." — the numbers follow
 * whatever goScoring is set to in rules.ts; only the example's starting 5 points and
 * 3 Gos are fixed, to keep the sentence concrete. */
function workedExampleLine(lang: Lang): string {
  const base = 5;
  const goCount = 3;
  const final = scoreAfterGos(base, goCount);
  const multiplier = RULES.goScoring === 'standard' && goCount >= 3 ? 2 ** (goCount - 2) : 1;
  const formula =
    multiplier > 1 ? `(${base} + 2) × ${multiplier} = ${final}` : `${base} + ${goCount} = ${final}`;
  return lang === 'ko'
    ? `${base}점, 고 ${goCount}번 → ${formula}칩 (상대 한 명당)`
    : `${base} points, ${goCount} Gos → ${formula} chips from each opponent.`;
}

/** The three chip amounts shown next to the decision: stopping now, going and winning
 * by one more point, and going and losing (paying the goBak share). Both use the current
 * threshold as the stand-in score — the decision moment has no other number to go on. */
function chipMath(threshold: number) {
  return {
    stop: threshold,
    goWin: scoreAfterGos(threshold + 1, 1),
    goLose: threshold * 2,
  };
}

export function SectionGoStop() {
  const { locale } = useLocale();
  const { players } = usePlayers();
  const T = callThreshold(players);
  const ko = locale === 'ko';

  return (
    <section
      id="section-gostop"
      className="relative py-24 border-t border-hairline section-gostop-bg"
    >
      <div className="lg:ml-72">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-16">
          <SectionTitle section={SECTION} />
          <FadeInOnView
            as="p"
            delay={0.12}
            className="text-body text-ink-soft max-w-2xl leading-relaxed mb-8"
          >
            {ko
              ? `게임 이름에 들어간 그 결정. ${T}점에 도달하는 순간, 멈출지 더 갈지를 직접 골라야 해요. ${goScoringLine('ko')} ${goBakLine(players, 'ko')} 욕심과 리스크 사이의 줄타기.`
              : `The decision baked into the game's name. The moment you hit ${T} points, you choose: end the round or go on. ${goScoringLine('en')} ${goBakLine(players, 'en')}`}
          </FadeInOnView>

          {/* How many are at the table decides how many points you need before you may call. */}
          <div className="mb-12">
            <PlayersSwitch />
            <p className="mt-3 text-body text-ink-soft">
              {ko
                ? `${players}인 테이블: ${T}점부터 고/스톱을 부를 수 있어요.`
                : `${players}-player table: you can call Go or Stop from ${T} points.`}
            </p>
          </div>

          <DecisionMoment threshold={T} players={players} />

          <div className="mt-16">
            <h3 className="text-label uppercase tracking-[0.18em] font-semibold text-ink-soft mb-5">
              {RULES.goScoring === 'flat'
                ? ko
                  ? '고 진행 — 고마다 추가되는 점수'
                  : 'Go progression — points per Go'
                : ko
                  ? '고 진행 — 추가 점수와 배수'
                  : 'Go progression — points and multipliers'}
            </h3>
            <MultiplierTable />
            <p className="text-label text-ink-soft mt-4 max-w-[65ch]">
              {ko ? `예: ${workedExampleLine('ko')}` : `Example: ${workedExampleLine('en')}`}
            </p>
            <p className="text-label text-ink-soft mt-2 max-w-[65ch]">
              {ko
                ? `* 고할 때마다 점수를 1점 이상 더 올려야 다시 고할 수 있어요. ${nagariLine('ko')}`
                : `* Each Go requires you to score at least one more point before calling again. ${nagariLine('en')}`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function DecisionMoment({ threshold, players }: { threshold: number; players: Players }) {
  const { locale } = useLocale();
  const [hover, setHover] = useState<Choice | null>(null);
  const ko = locale === 'ko';
  const goBak = goBakLine(players, locale);
  const chips = chipMath(threshold);

  return (
    <div className="club-card p-6 md:p-10">
      <div className="text-center mb-6">
        <div className="text-label uppercase tracking-[0.22em] text-ink-soft mb-2">
          {ko ? '내 점수' : 'Your score'}
        </div>
        <div className="text-num font-bold tabular-nums">{threshold}</div>
        <div className="text-body text-ink-soft mt-1">
          {ko ? '결정해야 해요' : 'Time to decide'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <PathCard
          choice="stop"
          active={hover === 'stop'}
          onHover={(b) => setHover(b ? 'stop' : null)}
          accent="sage"
          icon={<ShieldCheck className="size-4" />}
          label={ko ? '스톱' : 'Stop'}
          subtitle={ko ? '라운드 종료' : 'End the round'}
          desc={
            ko
              ? '내 점수로 라운드 마무리. 안전하게 승리 확정.'
              : 'Lock in your current score. Round ends, you win — at base value.'
          }
        />
        <PathCard
          choice="go"
          active={hover === 'go'}
          onHover={(b) => setHover(b ? 'go' : null)}
          accent="gold"
          icon={<Zap className="size-4" />}
          label={ko ? '고' : 'Go'}
          subtitle={ko ? '한 번 더 노려요' : 'Push for more'}
          desc={`${ko ? '라운드를 계속해서 더 많은 점수를.' : 'Continue scoring.'} ${goScoringLine(locale)} ${goBak}`.trim()}
        />
      </div>

      {/* Chip math: what each path is worth right now, in chips (1 chip per point). */}
      <div className="mt-6 max-w-2xl mx-auto border-t border-hairline pt-5">
        <div className="text-label uppercase tracking-[0.18em] font-semibold text-ink-soft mb-3">
          {ko ? '칩으로 보면' : 'In chips'}
        </div>
        <dl className="space-y-3">
          <ChipMathRow
            label={ko ? '지금 스톱' : 'Stop now'}
            value={ko ? `상대 한 명당 ${chips.stop}칩` : `${chips.stop} from each`}
          />
          <ChipMathRow
            label={ko ? '고 후 +1점 승리' : 'Go and win at +1 point'}
            value={ko ? `상대 한 명당 ${chips.goWin}칩` : `${chips.goWin} from each`}
          />
          <ChipMathRow
            label={ko ? '고 후 패배' : 'Go and lose'}
            value={
              ko
                ? `${chips.goLose}칩을 물어요 (테이블 전체 몫)`
                : `you pay ${chips.goLose} (the whole table's share)`
            }
          />
        </dl>
      </div>
    </div>
  );
}

function ChipMathRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-body">
      <div className="text-ink-soft">{label}</div>
      <div className="mt-0.5 font-bold tabular-nums">{value}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function PathCard({
  choice,
  active,
  onHover,
  accent,
  icon,
  label,
  subtitle,
  desc,
}: {
  choice: Choice;
  active: boolean;
  onHover: (h: boolean) => void;
  accent: 'sage' | 'gold';
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  desc: string;
}) {
  void choice;
  // Fill colors by meaning: sage = safe (Stop), gold = risky push (Go).
  const cls =
    accent === 'sage'
      ? { dot: 'bg-sage', hover: 'hover:bg-sage/15' }
      : { dot: 'bg-gold', hover: 'hover:bg-gold/20' };
  return (
    <motion.div
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      animate={{ scale: active ? 1.015 : 1 }}
      transition={{ type: 'spring', stiffness: 360, damping: 26 }}
      className={`rounded-card bg-paper p-6 transition-colors cursor-default ${cls.hover}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <span
          className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full text-on-fill ${cls.dot}`}
        >
          {icon}
        </span>
        <span className="font-display text-sub">{label}</span>
      </div>
      <div className="text-body text-ink-soft mb-3">{subtitle}</div>
      <p className="text-body text-ink leading-relaxed">{desc}</p>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */

const GO_LABELS: ReadonlyArray<{ en: string; ko: string }> = [
  { en: 'Stop', ko: '스톱' },
  { en: '1-Go', ko: '1고' },
  { en: '2-Go', ko: '2고' },
  { en: 'Three-Go', ko: '쓰리고 (3고)' },
  { en: '4-Go+', ko: '포고+' },
];

/** The note under each row of the Go progression table. */
function goNote(goCount: number, lang: Lang): string {
  const flat = RULES.goScoring === 'flat';
  const en = [
    'End now, base score.',
    'One more point on top.',
    flat ? 'Two extra points in all.' : 'Two points on top in all.',
    flat ? 'Three extra points in all.' : 'Score doubled — turning point.',
    flat ? 'One more point for every further Go.' : 'Each further Go doubles it again.',
  ];
  const ko = [
    '현재 점수 그대로 종료.',
    '점수에 1점 추가.',
    '점수에 총 2점 추가.',
    flat ? '점수에 총 3점 추가.' : '점수 2배 — 진짜 시작.',
    flat ? '고를 할 때마다 1점씩 더.' : '한 번 갈 때마다 다시 2배.',
  ];
  return (lang === 'ko' ? ko : en)[goCount];
}

/** The Go progression table. What it shows follows the goScoring rule. */
function MultiplierTable() {
  const { locale } = useLocale();
  const rows = goRows();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {rows.map((r) => {
        const value =
          r.goCount === 0
            ? '+0'
            : r.multiplier > 1
              ? `×${r.multiplier}${r.orMore ? '↑' : ''}`
              : `+${r.bonusPoints}${r.orMore ? '↑' : ''}`;
        // The doubling step is the turning point, but only when doubling is on.
        const emphasis = RULES.goScoring === 'standard' && r.goCount === 3;
        return (
          <div
            key={r.goCount}
            className={`rounded-card p-4 ${emphasis ? 'bg-gold/30' : 'bg-surface'}`}
          >
            <div className="text-label uppercase tracking-wider font-semibold text-ink-soft mb-1">
              {locale === 'ko' ? GO_LABELS[r.goCount].ko : GO_LABELS[r.goCount].en}
            </div>
            <div className="text-sub font-bold tabular-nums">{value}</div>
            <div className="text-label text-ink-soft leading-snug mt-1">
              {goNote(r.goCount, locale)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
