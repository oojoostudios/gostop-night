'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLocale } from '@/contexts/locale-context';
import { FadeInOnView } from '@/components/fade-in-on-view';
import { Mascot } from '@/components/mascot';
import { SetupView } from '@/components/tonight-setup';
import { TableView } from '@/components/tonight-table';
import { RecordHandDialog } from '@/components/tonight-record';
import { CashOutView } from '@/components/tonight-cashout';
import { useDemoFlag, useMounted, useTonight } from '@/lib/use-tonight';
import {
  finishEvent,
  rebuy,
  recordDraw,
  recordHand,
  signedMoney,
  standings,
  startEvent,
  undoLastHand,
  type TonightEvent,
} from '@/lib/tonight';

/** null = show whatever fits (the table if a night is on, otherwise the start screen). */
type View = null | 'setup' | 'cashout' | { past: string };

/**
 * Section 07: Tonight, the buy-in and scorecard.
 * A local scorekeeper: it saves on this phone only. With `?demo=1` it runs on a sample night instead
 * and never touches the saved data (the /showcase page uses that).
 */
export function SectionTonight() {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  const t = (en: string, kr: string) => (ko ? kr : en);
  const demo = useDemoFlag();
  const mounted = useMounted();
  const { state, update } = useTonight(demo);
  const [view, setView] = useState<View>(null);
  const [recording, setRecording] = useState(false);

  const active = state.active;
  const pastEvent =
    typeof view === 'object' && view ? state.past.find((p) => p.id === view.past) : undefined;

  let screen: 'home' | 'setup' | 'table' | 'cashout' | 'past';
  if (view === 'setup') screen = 'setup';
  else if (view === 'cashout' && active) screen = 'cashout';
  else if (pastEvent) screen = 'past';
  else screen = active ? 'table' : 'home';

  return (
    <section id="section-tonight" className="relative border-t border-hairline py-24">
      <div className="lg:ml-72">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-16">
          <FadeInOnView
            as="h2"
            delay={0.05}
            className="mb-6 font-display text-4xl leading-tight md:text-5xl"
          >
            <span className="text-plum">07</span>
            <span className="ml-4">{t('Tonight', '오늘 밤')}</span>
          </FadeInOnView>
          <FadeInOnView
            as="p"
            delay={0.12}
            className="mb-10 max-w-2xl text-lg leading-relaxed text-ink-soft"
          >
            {t(
              "Buy-ins, hands and a running scorecard for this table. It's saved on this phone only.",
              '이 테이블의 바이인, 판 기록, 실시간 점수판. 이 폰에만 저장돼요.',
            )}{' '}
            <span className="text-ink">
              {t(
                'Chips are tracked here — settle up in person.',
                '칩은 여기서 기록만 해요 — 정산은 직접 만나서 하세요.',
              )}
            </span>
          </FadeInOnView>

          <div className="min-h-[20rem]">
            {mounted && (
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={screen}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {screen === 'home' && (
                    <HomeView
                      past={state.past}
                      onStart={() => setView('setup')}
                      onOpenPast={(id) => setView({ past: id })}
                    />
                  )}
                  {screen === 'setup' && (
                    <SetupView
                      onCancel={() => setView(null)}
                      onStart={(ev) => {
                        update((s) => startEvent(s, ev));
                        setView(null);
                      }}
                    />
                  )}
                  {screen === 'table' && active && (
                    <TableView
                      ev={active}
                      onRecord={() => setRecording(true)}
                      onUndo={() => update(undoLastHand)}
                      onCashOut={() => setView('cashout')}
                      onRebuy={(id) => update((s) => rebuy(s, id))}
                    />
                  )}
                  {screen === 'cashout' && active && (
                    <CashOutView
                      ev={active}
                      onBack={() => setView(null)}
                      onFinish={() => {
                        update((s) => finishEvent(s));
                        setView(null);
                      }}
                    />
                  )}
                  {screen === 'past' && pastEvent && (
                    <CashOutView ev={pastEvent} readOnly onBack={() => setView(null)} />
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {active && (
        <RecordHandDialog
          ev={active}
          isOpen={recording}
          onClose={() => setRecording(false)}
          onSaveHand={(input) => update((s) => recordHand(s, input))}
          onSaveDraw={() => update((s) => recordDraw(s))}
        />
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Start screen (no night in progress) and past events                          */
/* -------------------------------------------------------------------------- */

function HomeView({
  past,
  onStart,
  onOpenPast,
}: {
  past: TonightEvent[];
  onStart: () => void;
  onOpenPast: (id: string) => void;
}) {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  const t = (en: string, kr: string) => (ko ? kr : en);
  return (
    <div className="space-y-10">
      <div className="club-card flex flex-col items-center gap-4 p-8 text-center">
        <Mascot alt="" className="w-28" />
        <h3 className="font-display text-2xl">
          {t('No game night yet', '아직 게임 나이트가 없어요')}
        </h3>
        <p className="max-w-[40ch] text-base text-ink-soft">
          {t(
            'Start one to keep track of buy-ins, chips and scores for your table.',
            '바이인, 칩, 점수를 기록할 게임 나이트를 시작하세요.',
          )}
        </p>
        <button
          type="button"
          className="club-btn club-btn--primary mt-2 text-base"
          onClick={onStart}
        >
          {t("Start tonight's game", '오늘의 게임 시작')}
        </button>
      </div>

      {past.length > 0 && (
        <div>
          <h3 className="mb-4 font-display text-xl">{t('Past events', '지난 게임')}</h3>
          <ul className="grid gap-3 sm:grid-cols-2" data-testid="past-events">
            {past.map((ev) => (
              <li key={ev.id}>
                <button
                  type="button"
                  onClick={() => onOpenPast(ev.id)}
                  className="club-card block w-full p-5 text-left"
                >
                  <div className="truncate font-display text-lg">{ev.name}</div>
                  <div className="mt-0.5 text-xs tabular-nums text-ink-soft">{ev.date}</div>
                  <div className="mt-3 text-sm tabular-nums">
                    {standings(ev)
                      .map((r) => `${r.player.name} ${signedMoney(r.netDollars)}`)
                      .join(' · ')}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
