'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, RotateCcw, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@heroui/react';
import { useLocale } from '@/contexts/locale-context';
import { FadeInOnView } from '@/components/fade-in-on-view';
import { PlayersSwitch } from '@/components/players-switch';
import { usePlayers } from '@/lib/use-players';
import { RULES, SCORING, callThreshold, goRows, type Players } from '@/config/rules';

type Choice = 'stop' | 'go';
type ScenarioState = { picked?: Choice };

type Scenario = {
  id: string;
  title: string;
  titleKo: string;
  setup: string;
  setupKo: string;
  /** Compact bullets to show under setup. */
  facts: { label: string; labelKo: string; value: string }[];
  best: Choice;
  reasoningStop: string;
  reasoningStopKo: string;
  reasoningGo: string;
  reasoningGoKo: string;
};

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

/** The three "Try the call" examples, with the numbers filled in for this many players. */
function buildScenarios(players: Players): ReadonlyArray<Scenario> {
  const T = callThreshold(players);
  const two = players === 2;
  const bakEn = goBakClause(players, 'en');
  const bakKo = goBakClause(players, 'ko');
  const brightsThree = SCORING.brights.three;
  const brightsFour = SCORING.brights.four;
  // "Far from a comeback": opponents sit well under the threshold.
  const low1 = Math.round(T * 0.45);
  const low2 = Math.round(T * 0.3);

  return [
    {
      id: 'safe-stop',
      title: 'Safe stop',
      titleKo: '안전한 스톱',
      setup: `You've just hit ${T} points. ${
        two ? 'Your opponent is' : 'Both opponents are'
      } far from a comeback, and the deck is almost empty.`,
      setupKo: `방금 ${T}점 달성. ${
        two ? '상대는' : '상대 둘 다'
      } 점수가 낮고, 더미도 거의 다 떨어졌어요.`,
      facts: [
        { label: 'Your score', labelKo: '내 점수', value: String(T) },
        {
          label: two ? 'Opponent' : 'Opponents',
          labelKo: '상대',
          value: two ? String(low1) : `${low1} / ${low2}`,
        },
        { label: 'Cards left', labelKo: '남은 더미', value: '4' },
      ],
      best: 'stop',
      reasoningStop: `Locking in ${T} points is the safer call. The deck is too thin for ${
        two ? 'your opponent' : 'opponents'
      } to catch up, but also too thin for you to add another point comfortably.`,
      reasoningStopKo: `${T}점에 안전하게 멈추는 게 정답이에요. 더미가 4장밖에 안 남아서 상대가 추격하기도, 내가 1점 더 따기도 쉽지 않아요.`,
      reasoningGo: `Going here is greedy. With only 4 cards in the deck you might not score the extra point — and if an opponent stops first, ${bakEn}.`,
      reasoningGoKo: `이 상황에서 고는 욕심이에요. 더미 4장 안에 1점을 더 만들지 못할 수도 있고, 그 사이 상대가 먼저 스톱하면 ${bakKo}.`,
    },
    {
      id: 'tempting-go',
      title: 'Tempting go',
      titleKo: '고고고',
      setup: `You hit ${T} with two brights (광) already, and you can see the third bright is on the floor — easily reachable. Plenty of deck left.`,
      setupKo: `광 2장으로 ${T}점 달성. 바닥에 또 다른 광이 보이고, 더미도 충분히 남아있어요.`,
      facts: [
        { label: 'Your score', labelKo: '내 점수', value: String(T) },
        { label: 'Brights you have', labelKo: '내 광', value: '2 / 5' },
        { label: 'Bright on floor', labelKo: '바닥의 광', value: '✓' },
        { label: 'Cards left', labelKo: '남은 더미', value: '12' },
      ],
      best: 'go',
      reasoningStop: `Stopping at ${T} leaves a lot on the table. With three brights reachable and 12 cards left, going is mathematically the better call.`,
      reasoningStopKo: `${T}점에서 멈추면 너무 보수적. 3광 (${brightsThree}점)이 보이고 더미도 12장 남아있으니, 기댓값상 고가 더 좋은 선택.`,
      reasoningGo: `Going makes sense. If you grab the third bright you add ${brightsThree} more points; that lets you call '1-go' and possibly aim for four brights = ${brightsFour} points.`,
      reasoningGoKo: `고는 합리적이에요. 바닥의 광을 먹으면 3광(${brightsThree}점)이 되고, 1고 → 4광(${brightsFour}점) 노릴 수도 있어요.`,
    },
    {
      id: 'losing-go',
      title: 'Trap of going',
      titleKo: '함정의 고',
      setup: `You hit ${T} but an opponent is at ${T - 1} and clearly hunting brights — they have 2 already. Going here is dangerous.`,
      setupKo: `내가 ${T}점인데, 한 상대가 ${T - 1}점에 광 2장으로 광을 노리고 있어요. 여기서 고는 위험해요.`,
      facts: [
        { label: 'Your score', labelKo: '내 점수', value: String(T) },
        { label: 'Top opponent', labelKo: '상위 상대', value: String(T - 1) },
        { label: 'Their brights', labelKo: '상대 광', value: '2 / 5' },
        { label: 'Cards left', labelKo: '남은 더미', value: '10' },
      ],
      best: 'stop',
      reasoningStop: `Stop now. Going makes you a target — if your opponent reaches ${T} next turn and stops first, ${bakEn}.`,
      reasoningStopKo: `지금은 스톱. 고하면 표적이 돼요. 상대가 ${T}점 도달해서 스톱하면, ${bakKo}.`,
      reasoningGo: `Going is risky here. The opponent only needs one bright pair to overtake — and your ${T} points turn into a loss instead of a win.`,
      reasoningGoKo: `고는 위험해요. 상대가 광 한 쌍만 더 모으면 추월당하고, 내가 쌓은 ${T}점이 빚이 돼요.`,
    },
  ];
}

export function SectionGoStop() {
  const { locale } = useLocale();
  const { players } = usePlayers();
  const T = callThreshold(players);
  const scenarios = buildScenarios(players);
  const ko = locale === 'ko';

  return (
    <section
      id="section-gostop"
      className="relative py-24 border-t border-hairline section-gostop-bg"
    >
      <div className="lg:ml-72">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-16">
          <FadeInOnView
            as="h2"
            delay={0.05}
            className="font-display text-4xl md:text-5xl leading-tight mb-6"
          >
            <span className="text-plum">06</span>
            <span className="ml-4">{ko ? '고냐 스톱이냐' : 'Go or Stop?'}</span>
          </FadeInOnView>
          <FadeInOnView
            as="p"
            delay={0.12}
            className="text-lg text-ink-soft max-w-2xl leading-relaxed mb-8"
          >
            {ko
              ? `게임 이름에 들어간 그 결정. ${T}점에 도달하는 순간, 멈출지 더 갈지를 직접 골라야 해요. ${goScoringLine('ko')} ${goBakLine(players, 'ko')} 욕심과 리스크 사이의 줄타기.`
              : `The decision baked into the game's name. The moment you hit ${T} points, you choose: end the round or go on. ${goScoringLine('en')} ${goBakLine(players, 'en')}`}
          </FadeInOnView>

          {/* How many are at the table decides how many points you need before you may call. */}
          <div className="mb-12">
            <PlayersSwitch />
            <p className="mt-3 text-sm text-ink-soft">
              {ko
                ? `${players}인 테이블: ${T}점부터 고/스톱을 부를 수 있어요.`
                : `${players}-player table: you can call Go or Stop from ${T} points.`}
            </p>
          </div>

          <DecisionMoment threshold={T} players={players} />

          <div className="mt-16">
            <h3 className="text-sm uppercase tracking-[0.18em] font-semibold text-ink-soft mb-5">
              {RULES.goScoring === 'flat'
                ? ko
                  ? '고 진행 — 고마다 추가되는 점수'
                  : 'Go progression — points per Go'
                : ko
                  ? '고 진행 — 추가 점수와 배수'
                  : 'Go progression — points and multipliers'}
            </h3>
            <MultiplierTable />
            <p className="text-xs text-ink-soft mt-4 max-w-[65ch]">
              {ko
                ? `* 고할 때마다 점수를 1점 이상 더 올려야 다시 고할 수 있어요. ${nagariLine('ko')}`
                : `* Each Go requires you to score at least one more point before calling again. ${nagariLine('en')}`}
            </p>
          </div>

          <div className="mt-16">
            <h3 className="text-sm uppercase tracking-[0.18em] font-semibold text-ink-soft mb-5">
              {ko ? '직접 골라보기' : 'Try the call'}
            </h3>
            <div className="space-y-4">
              {scenarios.map((s) => (
                <ScenarioCard key={s.id} scenario={s} />
              ))}
            </div>
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

  return (
    <div className="club-card p-6 md:p-10">
      <div className="text-center mb-6">
        <div className="text-xs uppercase tracking-[0.22em] text-ink-soft mb-2">
          {ko ? '내 점수' : 'Your score'}
        </div>
        <div className="text-7xl md:text-8xl font-bold tabular-nums">{threshold}</div>
        <div className="text-sm text-ink-soft mt-1">{ko ? '결정해야 해요' : 'Time to decide'}</div>
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
        <span className="font-display text-2xl">{label}</span>
      </div>
      <div className="text-sm text-ink-soft mb-3">{subtitle}</div>
      <p className="text-sm text-ink leading-relaxed">{desc}</p>
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
            <div className="text-xs uppercase tracking-wider font-semibold text-ink-soft mb-1">
              {locale === 'ko' ? GO_LABELS[r.goCount].ko : GO_LABELS[r.goCount].en}
            </div>
            <div className="text-xl font-bold tabular-nums">{value}</div>
            <div className="text-xs text-ink-soft leading-snug mt-1">
              {goNote(r.goCount, locale)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const { locale } = useLocale();
  const [state, setState] = useState<ScenarioState>({});

  const pick = (c: Choice) => setState({ picked: c });
  const reset = () => setState({});

  return (
    <div className="club-card p-6">
      <h4 className="font-display text-xl mb-2">
        {locale === 'ko' ? scenario.titleKo : scenario.title}
      </h4>
      <p className="text-sm text-ink-soft leading-relaxed mb-4">
        {locale === 'ko' ? scenario.setupKo : scenario.setup}
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {scenario.facts.map((f) => (
          <div key={f.label} className="rounded-md bg-paper px-3 py-1.5 text-xs">
            <span className="text-ink-soft mr-1.5">{locale === 'ko' ? f.labelKo : f.label}</span>
            <span className="font-bold tabular-nums">{f.value}</span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!state.picked ? (
          <motion.div
            key="choices"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-3 max-w-sm"
          >
            <button
              type="button"
              onClick={() => pick('stop')}
              className="club-btn club-btn--primary"
            >
              <ShieldCheck className="size-4" />
              {locale === 'ko' ? '스톱' : 'Stop'}
            </button>
            <button type="button" onClick={() => pick('go')} className="club-btn">
              <Zap className="size-4" />
              {locale === 'ko' ? '고' : 'Go'}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <Verdict
              choice={state.picked}
              best={scenario.best}
              reasoning={
                state.picked === 'stop'
                  ? locale === 'ko'
                    ? scenario.reasoningStopKo
                    : scenario.reasoningStop
                  : locale === 'ko'
                    ? scenario.reasoningGoKo
                    : scenario.reasoningGo
              }
            />
            <Button variant="ghost" size="sm" onPress={reset} className="mt-3 gap-1.5 text-xs">
              <RotateCcw className="size-3.5" />
              {locale === 'ko' ? '다시' : 'Try again'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Verdict({ choice, best, reasoning }: { choice: Choice; best: Choice; reasoning: string }) {
  const { locale } = useLocale();
  const correct = choice === best;
  return (
    <div className={`rounded-card px-5 py-4 ${correct ? 'bg-sage/25' : 'bg-plum/15'}`}>
      <div className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2 text-ink">
        <span
          className={`size-2.5 shrink-0 rounded-full ${correct ? 'bg-sage' : 'bg-plum'}`}
          aria-hidden
        />
        {correct
          ? locale === 'ko'
            ? '좋은 선택'
            : 'Good call'
          : locale === 'ko'
            ? '위험한 선택'
            : 'Risky pick'}
        <ArrowRight className="size-3.5" />
        <span className="font-normal normal-case tracking-normal text-ink-soft">
          {locale === 'ko'
            ? choice === 'stop'
              ? '스톱했어요'
              : '고했어요'
            : choice === 'stop'
              ? 'you chose stop'
              : 'you chose go'}
        </span>
      </div>
      <p className="text-sm text-ink leading-relaxed max-w-[65ch]">{reasoning}</p>
    </div>
  );
}
