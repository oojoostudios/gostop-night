'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { Check } from 'lucide-react';
import { useLocale } from '@/contexts/locale-context';
import { chipValue, chipValueText, money, signed, signedMoney } from '@/lib/tonight';
import { liveBalance, liveStandings } from '@/lib/live/standings';
import { createLiveClient } from '@/lib/supabase/browser';
import type { PublicEvent } from '@/lib/live/events';
import type { HandRow } from '@/lib/live/hands';
import type { PlayerRow, TableRow } from '@/lib/live/types';
import { CreateTableForm } from '@/components/create-table-form';
import { AddPlayerForm } from '@/components/add-player-form';
import { CountUp } from '@/components/count-up';
import { cashOutPlayerAction, movePlayerAction, rebuyAction } from '@/app/host/[eventCode]/actions';

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
  accessToken,
}: {
  event: PublicEvent;
  initialTables: TableWithQr[];
  initialPlayers: PlayerRow[];
  initialHands: HandRow[];
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
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

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
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, event.id]);

  const chipVal = chipValue({ buyIn: event.buy_in_dollars, chipsPerBuyIn: event.chips_per_buy_in });
  const chipValueLabel = chipValueText(chipVal);
  const balance = liveBalance(players, event.chips_per_buy_in);

  const runAction = (playerId: string, fn: () => Promise<void>) => {
    setActionError(null);
    setPendingId(playerId);
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

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-title">{event.name}</h1>
        <span className="text-label tabular-nums text-ink-soft">{event.date}</span>
      </div>
      <p className="mt-1 text-label uppercase tracking-[0.18em] text-ink-soft">
        {t('Host', '호스트')} · {event.code}
      </p>

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

              return (
                <div key={table.id} className="rounded-input bg-paper p-4 sm:p-5">
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

                  {rows.length === 0 ? (
                    <p className="mt-3 text-body text-ink-soft">
                      {t('No players yet.', '아직 플레이어가 없어요.')}
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-3">
                      {rows.map((r) => (
                        <li key={r.player.id} className="rounded-input bg-surface p-3">
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
          <CreateTableForm eventCode={event.code} />
        </div>
      </div>

      <div className="club-card mt-6 space-y-5 p-5 sm:p-6">
        <h2 className="text-sub font-display">{t('Add a player', '플레이어 추가')}</h2>
        <AddPlayerForm eventCode={event.code} tables={tables} />
      </div>
    </div>
  );
}
