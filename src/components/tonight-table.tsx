'use client';

import { useState } from 'react';
import { Check, Plus, Undo2 } from 'lucide-react';
import { useLocale } from '@/contexts/locale-context';
import { CountUp } from '@/components/count-up';
import {
  balance,
  chipValue,
  chipValueText,
  hasHandToUndo,
  nextHandDoubled,
  signed,
  standings,
  type LogEntry,
  type TonightEvent,
} from '@/lib/tonight';
import { RULES } from '@/config/rules';

/* -------------------------------------------------------------------------- */
/* Balance check                                                               */
/* -------------------------------------------------------------------------- */

/** Chips on the table must equal chips bought in: a green check, or the difference in red. */
export function BalanceCheck({ ev }: { ev: TonightEvent }) {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  const b = balance(ev);
  return (
    <div className="flex flex-wrap items-center gap-3" aria-live="polite" data-testid="balance">
      {b.ok ? (
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-sage text-on-fill">
            <Check className="size-4" strokeWidth={3} />
          </span>
          <span className="text-base font-medium tabular-nums">
            {ko
              ? `칩이 맞아요: 테이블 ${b.onTable} = 산 칩 ${b.boughtIn}`
              : `Chips balance: ${b.onTable} on the table = ${b.boughtIn} bought in`}
          </span>
        </div>
      ) : (
        <>
          <span className="rounded-full bg-plum px-3 py-1 text-base font-bold tabular-nums text-surface">
            {ko ? `칩 ${signed(b.diff)} 차이` : `Off by ${signed(b.diff)} chips`}
          </span>
          <span className="text-sm tabular-nums text-ink-soft">
            {ko
              ? `테이블 ${b.onTable} · 산 칩 ${b.boughtIn}`
              : `${b.onTable} on the table, ${b.boughtIn} bought in`}
          </span>
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* History                                                                     */
/* -------------------------------------------------------------------------- */

function describe(e: LogEntry, ev: TonightEvent, ko: boolean): string {
  const t = (en: string, kr: string) => (ko ? kr : en);
  const name = (id: string) => ev.players.find((p) => p.id === id)?.name ?? '?';
  if (e.kind === 'rebuy') {
    return t(
      `${name(e.playerId)} rebought +${e.chips} chips`,
      `${name(e.playerId)} 리바이 +${e.chips}칩`,
    );
  }
  if (e.kind === 'draw') {
    return RULES.nagariDoubles
      ? t('Draw (나가리) — next hand ×2', '나가리 — 다음 판 ×2')
      : t('Draw (나가리)', '나가리');
  }
  const goPart = e.gos > 0 ? t(` + ${e.gos} Go`, ` + 고 ${e.gos}`) : '';
  const results = ev.players
    .filter((p) => (e.deltas[p.id] ?? 0) !== 0)
    .map((p) => `${p.name} ${signed(e.deltas[p.id])}`)
    .join(', ');
  return t(
    `${name(e.winnerId)} won ${e.points} pts${goPart} · ${results}`,
    `${name(e.winnerId)} 승 ${e.points}점${goPart} · ${results}`,
  );
}

export function History({ ev }: { ev: TonightEvent }) {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  const [all, setAll] = useState(false);
  const entries = [...ev.log].reverse();
  const shown = all ? entries : entries.slice(0, 5);
  if (entries.length === 0) {
    return (
      <p className="text-sm text-ink-soft">
        {ko ? '아직 기록된 판이 없어요.' : 'No hands recorded yet.'}
      </p>
    );
  }
  return (
    <div>
      <ul className="space-y-2">
        {shown.map((e) => (
          <li key={e.id} className="text-sm leading-relaxed text-ink">
            {describe(e, ev, ko)}
          </li>
        ))}
      </ul>
      {entries.length > 5 && (
        <button
          type="button"
          className="club-chip mt-3"
          onClick={() => setAll((v) => !v)}
          aria-pressed={all}
        >
          {all
            ? ko
              ? '접기'
              : 'Show less'
            : ko
              ? `전체 보기 (${entries.length})`
              : `Show all (${entries.length})`}
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* The table                                                                   */
/* -------------------------------------------------------------------------- */

export function TableView({
  ev,
  onRecord,
  onUndo,
  onCashOut,
  onRebuy,
}: {
  ev: TonightEvent;
  onRecord: () => void;
  onUndo: () => void;
  onCashOut: () => void;
  onRebuy: (playerId: string) => void;
}) {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  const t = (en: string, kr: string) => (ko ? kr : en);
  const rows = standings(ev);
  const doubled = nextHandDoubled(ev);
  const v = chipValue(ev);

  return (
    <div className="space-y-6">
      <div className="club-card p-5 sm:p-6">
        <h3 className="font-display text-2xl leading-tight">{ev.name}</h3>
        <p className="mt-1 text-sm text-ink-soft tabular-nums">
          {ev.date} · {t('1 chip', '칩 1개')} = {chipValueText(v)} ·{' '}
          {t(`${ev.chipsPerPoint} chip per point`, `1점 = ${ev.chipsPerPoint}칩`)}
        </p>
        <div className="mt-4">
          <BalanceCheck ev={ev} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3" data-testid="players">
        {rows.map((r) => (
          <div key={r.player.id} className="club-card p-5">
            <div className="truncate font-display text-xl">{r.player.name}</div>
            <div className="mt-3 flex items-baseline gap-2">
              <CountUp value={r.chips} className="text-4xl font-bold" />
              <span className="text-sm text-ink-soft">{t('chips', '칩')}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-3 text-base tabular-nums">
              <span>
                <CountUp value={r.net} signed className="font-bold" />{' '}
                <span className="text-sm text-ink-soft">{t('net', '순')}</span>
              </span>
              <span>
                <span className="text-ink-soft">= </span>
                <CountUp value={r.dollars} decimals={2} prefix="$" className="font-medium" />
              </span>
            </div>
            <div className="mt-1 text-xs tabular-nums text-ink-soft">
              {t(`Buy-ins: ${r.buyIns}`, `바이인 ${r.buyIns}회`)}
            </div>
            <button
              type="button"
              className="club-btn mt-4 !px-4 !py-2 text-base"
              onClick={() => onRebuy(r.player.id)}
            >
              <Plus className="size-4" />
              {t(`Rebuy (+${ev.chipsPerBuyIn})`, `리바이 (+${ev.chipsPerBuyIn}칩)`)}
            </button>
          </div>
        ))}
      </div>

      {doubled && (
        <p className="inline-block rounded-full bg-gold px-3 py-1 text-sm font-medium text-on-fill">
          {t('Draw last time — next hand counts ×2', '지난 판 나가리 — 다음 판은 ×2')}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="button" className="club-btn club-btn--primary text-base" onClick={onRecord}>
          {t('Record a hand', '판 기록하기')}
        </button>
        <button
          type="button"
          className="club-btn text-base disabled:cursor-not-allowed disabled:opacity-40"
          onClick={onUndo}
          disabled={!hasHandToUndo(ev)}
        >
          <Undo2 className="size-4" />
          {t('Undo last hand', '마지막 판 취소')}
        </button>
        <button type="button" className="club-btn text-base" onClick={onCashOut}>
          {t('Cash out', '정산하기')}
        </button>
      </div>

      <div className="club-card p-5 sm:p-6">
        <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-ink-soft">
          {t('History', '기록')}
        </div>
        <History ev={ev} />
      </div>
    </div>
  );
}
