'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useReducedMotion } from 'motion/react';
import { Check, Download } from 'lucide-react';
import { useLocale } from '@/contexts/locale-context';
import { chipValue, chipValueText, money, signed, signedMoney } from '@/lib/tonight';
import { liveBalance, liveStandings } from '@/lib/live/standings';
import { createLiveClient } from '@/lib/supabase/browser';
import { downloadEventSummaryCsv } from '@/lib/live/csv';
import type { PublicEvent } from '@/lib/live/events';
import type { HandRow } from '@/lib/live/hands';
import type { PendingHandRow } from '@/lib/live/pending-hands';
import type { PlayerRow, TableRow } from '@/lib/live/types';
import { CreateTableForm } from '@/components/create-table-form';
import { AddPlayerForm } from '@/components/add-player-form';
import { CountUp } from '@/components/count-up';
import {
  cashOutPlayerAction,
  deleteTableAction,
  movePlayerAction,
  rebuyAction,
  removePlayerAction,
  resolvePendingHandAction,
  undoRebuyAction,
} from '@/app/host/[eventCode]/actions';

/** The next free "Table N" name — reuses a freed number rather than only ever counting up. */
function suggestedTableName(tables: TableRow[]): string {
  const taken = new Set(tables.map((tb) => tb.name.trim().toLowerCase()));
  let n = 1;
  while (taken.has(`table ${n}`)) n++;
  return `Table ${n}`;
}

export type TableWithQr = { table: TableRow; qrDataUrl: string };

function upsertById<T extends { id: string }>(list: T[], row: T): T[] {
  const idx = list.findIndex((x) => x.id === row.id);
  if (idx === -1) return [...list, row];
  const copy = list.slice();
  copy[idx] = row;
  return copy;
}
function removeById<T extends { id: string }>(list: T[], id: string): T[] {
  return list.filter((x) => x.id !== id);
}

export function HostDashboard({
  event,
  initialTables,
  initialPlayers,
  initialHands,
  initialPendingHands,
  accessToken,
}: {
  event: PublicEvent;
  initialTables: TableWithQr[];
  initialPlayers: PlayerRow[];
  initialHands: HandRow[];
  initialPendingHands: PendingHandRow[];
  accessToken: string;
}) {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  const t = (en: string, kr: string) => (ko ? kr : en);

  const supabase = useMemo(() => createLiveClient(accessToken), [accessToken]);
  const [tables, setTables] = useState(initialTables.map((tw) => tw.table));
  const qrByTableId = useMemo(
    () => new Map(initialTables.map((tw) => [tw.table.id, tw.qrDataUrl])),
    [initialTables],
  );
  const [players, setPlayers] = useState(initialPlayers);
  const [hands, setHands] = useState(initialHands);
  const [pendingHands, setPendingHands] = useState(initialPendingHands);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const channel = supabase
      .channel(`event:${event.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_tables', filter: `event_id=eq.${event.id}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setTables((prev) => removeById(prev, (payload.old as TableRow).id));
          } else {
            setTables((prev) => upsertById(prev, payload.new as TableRow));
          }
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `event_id=eq.${event.id}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setPlayers((prev) => removeById(prev, (payload.old as PlayerRow).id));
          } else {
            setPlayers((prev) => upsertById(prev, payload.new as PlayerRow));
          }
        },
      )
      // No filter: RLS ("host reads own hands") already scopes this to the host's own event.
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hands' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setHands((prev) => removeById(prev, (payload.old as HandRow).id));
        } else {
          setHands((prev) => upsertById(prev, payload.new as HandRow));
        }
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pending_hands', filter: `event_id=eq.${event.id}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setPendingHands((prev) => removeById(prev, (payload.old as PendingHandRow).id));
          } else {
            setPendingHands((prev) => upsertById(prev, payload.new as PendingHandRow));
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, event.id]);

  const chipVal = chipValue({ buyIn: event.buy_in_dollars, chipsPerBuyIn: event.chips_per_buy_in });
  const chipValueLabel = chipValueText(chipVal);
  const balance = liveBalance(players, event.chips_per_buy_in);
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? '?';

  const summaryRows = liveStandings(players, event.chips_per_buy_in, chipVal)
    .map((r) => ({
      name: r.player.name,
      tableName:
        tables.find((tb) => tb.id === r.player.table_id)?.name ?? t('Cashed out', '정산 완료'),
      buyIns: r.player.buy_ins,
      chips: r.player.chips,
      net: r.net,
      dollars: r.dollars,
      netDollars: r.netDollars,
    }))
    .sort((a, b) => b.netDollars - a.netDollars);

  const runAction = (rowId: string, fn: () => Promise<void>) => {
    setActionError(null);
    setPendingId(rowId);
    startTransition(async () => {
      try {
        await fn();
      } catch {
        setActionError(t('That action failed. Try again.', '작업에 실패했어요. 다시 시도하세요.'));
      } finally {
        setPendingId(null);
      }
    });
  };

  /** Like `runAction`, but for actions that return a reason instead of throwing on the
   * outcomes a host can actually fix (see the note on `removePlayerLive`). */
  const runGuardedAction = <R extends { ok: boolean; reason?: string }>(
    rowId: string,
    fn: () => Promise<R>,
    messages: Record<string, string>,
  ) => {
    setActionError(null);
    setPendingId(rowId);
    startTransition(async () => {
      try {
        const result = await fn();
        if (!result.ok && result.reason) {
          setActionError(messages[result.reason] ?? messages.default);
        }
      } catch {
        setActionError(t('That action failed. Try again.', '작업에 실패했어요. 다시 시도하세요.'));
      } finally {
        setPendingId(null);
      }
    });
  };

  const scrollAndHighlight = (domId: string, rowId: string) => {
    setHighlightedId(rowId);
    document
      .getElementById(domId)
      ?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    window.setTimeout(
      () => setHighlightedId((current) => (current === rowId ? null : current)),
      1600,
    );
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-title">{event.name}</h1>
        <span className="text-label tabular-nums text-ink-soft">{event.date}</span>
      </div>
      <p className="mt-1 text-label uppercase tracking-[0.18em] text-ink-soft">
        {t('Host', '호스트')} · {event.code}
      </p>

      {pendingHands.map((p) => {
        const tableName = tables.find((tb) => tb.id === p.table_id)?.name ?? '';
        return (
          <div key={p.id} className="club-card mt-8 space-y-3 p-5 sm:p-6" aria-live="polite">
            <h2 className="text-sub font-display">
              {t('Rebuy needed', '리바이 필요')} · {tableName}
            </h2>
            <ul className="space-y-1 text-body">
              {Object.entries(p.payload.shortfalls).map(([playerId, shortfall]) => {
                const rebuysNeeded = Math.ceil(shortfall / event.chips_per_buy_in);
                const dollars = event.buy_in_dollars * rebuysNeeded;
                const chips = event.chips_per_buy_in * rebuysNeeded;
                return (
                  <li key={playerId}>
                    {t(
                      `${nameOf(playerId)}: collect ${money(dollars)} → +${chips} chips`,
                      `${nameOf(playerId)}: ${money(dollars)} 수금 → +${chips}칩`,
                    )}
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              className="club-btn club-btn--primary text-body disabled:cursor-not-allowed disabled:opacity-40"
              disabled={pendingId === p.id}
              onClick={() => runAction(p.id, () => resolvePendingHandAction(event.code, p.id))}
            >
              {t('Confirm rebuy & save hand', '리바이 확인 및 판 저장')}
            </button>
          </div>
        );
      })}

      <div className="club-card mt-8 space-y-3 p-5 sm:p-6">
        <h2 className="text-sub font-display">{t('Event settings', '이벤트 설정')}</h2>
        <dl className="grid grid-cols-2 gap-y-2 text-body">
          <dt className="text-ink-soft">{t('Buy-in', '바이인')}</dt>
          <dd className="text-right tabular-nums">{money(event.buy_in_dollars)}</dd>
          <dt className="text-ink-soft">{t('Chips per buy-in', '바이인당 칩')}</dt>
          <dd className="text-right tabular-nums">{event.chips_per_buy_in}</dd>
          <dt className="text-ink-soft">{t('Chips per point', '점당 칩')}</dt>
          <dd className="text-right tabular-nums">{event.chips_per_point}</dd>
          <dt className="text-ink-soft">{t('1 chip is worth', '칩 1개 가치')}</dt>
          <dd className="text-right tabular-nums">{chipValueLabel}</dd>
        </dl>
        <div className="flex flex-wrap items-center gap-3 pt-1" aria-live="polite">
          {balance.ok ? (
            <div className="flex items-center gap-3">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-sage text-surface">
                <Check className="size-4" strokeWidth={3} />
              </span>
              <span className="text-body font-medium tabular-nums">
                {t(
                  `Chips balance: ${balance.onTable} on the table(s) = ${balance.boughtIn} bought in`,
                  `칩이 맞아요: 테이블 ${balance.onTable} = 산 칩 ${balance.boughtIn}`,
                )}
              </span>
            </div>
          ) : (
            <>
              <span className="rounded-full bg-plum px-3 py-1 text-body font-bold tabular-nums text-surface">
                {t(`Off by ${signed(balance.diff)} chips`, `칩 ${signed(balance.diff)} 차이`)}
              </span>
              <span className="text-label tabular-nums text-ink-soft">
                {balance.onTable} · {balance.boughtIn}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="club-card mt-6 space-y-5 p-5 sm:p-6">
        <h2 className="text-sub font-display">{t('Tables', '테이블')}</h2>

        {tables.length === 0 ? (
          <p className="text-body text-ink-soft">
            {t('No tables yet — add one below.', '아직 테이블이 없어요 — 아래에서 추가하세요.')}
          </p>
        ) : (
          <div className="space-y-5">
            {tables.map((table) => {
              const atThisTable = players.filter((p) => p.table_id === table.id);
              const rows = liveStandings(atThisTable, event.chips_per_buy_in, chipVal);
              const handsPlayed = hands.filter((h) => h.table_id === table.id).length;
              const otherTables = tables.filter((tb) => tb.id !== table.id);

              const canDeleteTable = rows.length === 0 && handsPlayed === 0;

              return (
                <div
                  key={table.id}
                  id={`table-row-${table.id}`}
                  className={`rounded-input bg-paper p-4 transition-shadow duration-700 sm:p-5 ${
                    highlightedId === table.id ? 'shadow-[0_0_0_2px_var(--color-plum)]' : ''
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="font-display text-sub">{table.name}</div>
                      <div
                        className="text-label tabular-nums text-ink-soft"
                        data-testid="table-code"
                      >
                        {table.code}
                      </div>
                      <div className="text-label tabular-nums text-ink-soft">
                        {t(
                          `${handsPlayed} hand${handsPlayed === 1 ? '' : 's'} played`,
                          `${handsPlayed}판 진행`,
                        )}
                      </div>
                    </div>
                    {qrByTableId.get(table.id) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrByTableId.get(table.id)}
                        alt={t(`QR code for ${table.name}`, `${table.name} QR 코드`)}
                        width={96}
                        height={96}
                        className="rounded-input"
                      />
                    )}
                  </div>

                  {canDeleteTable && (
                    <button
                      type="button"
                      className="club-btn mt-3 !px-3 !py-1.5 text-label disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={pendingId === table.id}
                      onClick={() =>
                        runGuardedAction(table.id, () => deleteTableAction(event.code, table.id), {
                          'not-empty': t(
                            'This table still has players or hands — remove or cash them out first.',
                            '이 테이블에는 아직 플레이어나 판 기록이 있어요 — 먼저 제거하거나 정산하세요.',
                          ),
                          default: t(
                            'That action failed. Try again.',
                            '작업에 실패했어요. 다시 시도하세요.',
                          ),
                        })
                      }
                    >
                      {t('Delete table', '테이블 삭제')}
                    </button>
                  )}

                  {rows.length === 0 ? (
                    <p className="mt-3 text-body text-ink-soft">
                      {t('No players yet.', '아직 플레이어가 없어요.')}
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-3">
                      {rows.map((r) => (
                        <li
                          key={r.player.id}
                          id={`player-row-${r.player.id}`}
                          className={`rounded-input bg-surface p-3 transition-shadow duration-700 ${
                            highlightedId === r.player.id
                              ? 'shadow-[0_0_0_2px_var(--color-plum)]'
                              : ''
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="truncate font-medium">{r.player.name}</span>
                            <span className="flex items-baseline gap-2 tabular-nums">
                              <CountUp value={r.player.chips} className="font-bold" />
                              <span className="text-label text-ink-soft">{t('chips', '칩')}</span>
                              <span className="text-label text-ink-soft">
                                ({signedMoney(r.netDollars)})
                              </span>
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              className="club-btn !px-3 !py-1.5 text-label disabled:cursor-not-allowed disabled:opacity-40"
                              disabled={pendingId === r.player.id}
                              onClick={() =>
                                runAction(r.player.id, () => rebuyAction(event.code, r.player.id))
                              }
                            >
                              {t(
                                `Rebuy (+${event.chips_per_buy_in})`,
                                `리바이 (+${event.chips_per_buy_in}칩)`,
                              )}
                            </button>
                            <button
                              type="button"
                              className="club-btn !px-3 !py-1.5 text-label disabled:cursor-not-allowed disabled:opacity-40"
                              disabled={pendingId === r.player.id}
                              onClick={() =>
                                runGuardedAction(
                                  r.player.id,
                                  () => undoRebuyAction(event.code, r.player.id),
                                  {
                                    'not-last-rebuy': t(
                                      `The last thing that happened to ${r.player.name} wasn't a rebuy — nothing to undo.`,
                                      `${r.player.name} 님의 마지막 기록이 리바이가 아니에요 — 취소할 게 없어요.`,
                                    ),
                                    default: t(
                                      'That action failed. Try again.',
                                      '작업에 실패했어요. 다시 시도하세요.',
                                    ),
                                  },
                                )
                              }
                            >
                              {t('Undo last rebuy', '리바이 취소')}
                            </button>
                            {otherTables.length > 0 && (
                              <select
                                className="club-input !bg-paper !py-1.5 text-label"
                                value=""
                                disabled={pendingId === r.player.id}
                                onChange={(e) => {
                                  const toTableId = e.target.value;
                                  if (!toTableId) return;
                                  runAction(r.player.id, () =>
                                    movePlayerAction(event.code, r.player.id, toTableId),
                                  );
                                  e.target.value = '';
                                }}
                              >
                                <option value="" disabled>
                                  {t('Move to…', '이동…')}
                                </option>
                                {otherTables.map((tb) => (
                                  <option key={tb.id} value={tb.id}>
                                    {tb.name}
                                  </option>
                                ))}
                              </select>
                            )}
                            <button
                              type="button"
                              className="club-btn !px-3 !py-1.5 text-label disabled:cursor-not-allowed disabled:opacity-40"
                              disabled={pendingId === r.player.id}
                              onClick={() =>
                                runAction(r.player.id, () =>
                                  cashOutPlayerAction(event.code, r.player.id),
                                )
                              }
                            >
                              {t('Cash out', '정산')}
                            </button>
                            <button
                              type="button"
                              className="club-btn !px-3 !py-1.5 text-label disabled:cursor-not-allowed disabled:opacity-40"
                              disabled={pendingId === r.player.id}
                              onClick={() =>
                                runGuardedAction(
                                  r.player.id,
                                  () => removePlayerAction(event.code, r.player.id),
                                  {
                                    'has-activity': t(
                                      `${r.player.name} has already played or rebought — cash them out instead.`,
                                      `${r.player.name} 님은 이미 게임에 참여했거나 리바이했어요 — 대신 정산을 사용하세요.`,
                                    ),
                                    default: t(
                                      'That action failed. Try again.',
                                      '작업에 실패했어요. 다시 시도하세요.',
                                    ),
                                  },
                                )
                              }
                            >
                              {t('Remove', '삭제')}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {actionError && (
          <p role="alert" className="text-body text-plum">
            {actionError}
          </p>
        )}

        <div className="border-t border-hairline pt-5">
          <CreateTableForm
            eventCode={event.code}
            suggestedName={suggestedTableName(tables)}
            onCreated={(id) => scrollAndHighlight(`table-row-${id}`, id)}
          />
        </div>
      </div>

      <div className="club-card mt-6 space-y-5 p-5 sm:p-6">
        <h2 className="text-sub font-display">{t('Add a player', '플레이어 추가')}</h2>
        <AddPlayerForm
          eventCode={event.code}
          tables={tables}
          onCreated={(id) => scrollAndHighlight(`player-row-${id}`, id)}
        />
      </div>

      <div className="club-card mt-6 space-y-5 p-5 sm:p-6">
        <h2 className="text-sub font-display">{t('End of night', '정산 요약')}</h2>
        {summaryRows.length === 0 ? (
          <p className="text-body text-ink-soft">
            {t('No players yet.', '아직 플레이어가 없어요.')}
          </p>
        ) : (
          <ul className="divide-y divide-hairline">
            {summaryRows.map((r) => (
              <li
                key={r.name + r.tableName}
                className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between"
              >
                <div>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-label tabular-nums text-ink-soft">
                    {r.tableName} · {t(`${r.buyIns} buy-ins`, `바이인 ${r.buyIns}회`)}
                  </div>
                </div>
                <div className="tabular-nums sm:text-right">
                  <div className="font-bold">
                    {r.chips}{' '}
                    <span className="text-label font-normal text-ink-soft">{t('chips', '칩')}</span>
                  </div>
                  <div className="text-body text-ink-soft">
                    {signed(r.net)} {t('chips', '칩')} · {signedMoney(r.netDollars)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          className="club-btn text-body"
          onClick={() => downloadEventSummaryCsv(event.name, event.date, summaryRows, ko)}
        >
          <Download className="size-4" />
          {t('Export CSV', 'CSV 내보내기')}
        </button>
      </div>
    </div>
  );
}
