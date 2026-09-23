'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useLocale } from '@/contexts/locale-context';
import { createLiveClient } from '@/lib/supabase/browser';
import { useLocalPlayer } from '@/lib/live/use-local-player';
import { useOnlineStatus } from '@/lib/live/use-online-status';
import { liveBalance, liveStandings } from '@/lib/live/standings';
import {
  pushToQueue,
  readQueue,
  removeFromQueue,
  type QueuedEntry,
} from '@/lib/live/offline-queue';
import type { PlayerRow } from '@/lib/live/types';
import type { HandRow } from '@/lib/live/hands';
import type { PendingHandRow } from '@/lib/live/pending-hands';
import {
  recordDrawAction,
  recordHandAction,
  setLockAction,
  clearLockAction,
  undoHandAction,
} from '@/app/t/[tableCode]/actions';
import { HandForm } from '@/components/tonight-record';
import { History } from '@/components/tonight-table';
import { CountUp } from '@/components/count-up';
import {
  chipValue,
  chipValueText,
  signedMoney,
  type HandInput,
  type LogEntry,
  type TonightEvent,
} from '@/lib/tonight';

type HandLockRow = {
  table_id: string;
  entered_by: string;
  hand_number: number;
  started_at: string;
};

function handRowToLogEntry(h: HandRow): LogEntry {
  if (h.is_draw) return { kind: 'draw', id: h.id, at: h.created_at };
  return {
    kind: 'hand',
    id: h.id,
    at: h.created_at,
    winnerId: h.winner_player_id ?? '',
    points: h.points ?? 0,
    gos: h.gos,
    shakes: h.shakes,
    bombs: h.bombs,
    afterDraw: h.after_draw,
    losers: h.losers,
    deltas: h.deltas,
  };
}

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

/** A lock nobody cleared (a phone that closed mid-entry) stops mattering after this long. */
const LOCK_STALE_MS = 5 * 60 * 1000;
const UNDO_WINDOW_MS = 2 * 60 * 1000;

export function TableScreen({
  table,
  event,
  initialPlayers,
  initialHands,
  accessToken,
}: {
  table: { id: string; code: string; name: string };
  event: { id: string; buyInDollars: number; chipsPerBuyIn: number; chipsPerPoint: number };
  initialPlayers: PlayerRow[];
  initialHands: HandRow[];
  accessToken: string;
}) {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  const t = (en: string, kr: string) => (ko ? kr : en);
  const online = useOnlineStatus();

  const supabase = useMemo(() => createLiveClient(accessToken), [accessToken]);
  const [players, setPlayers] = useState(initialPlayers);
  const [hands, setHands] = useState(initialHands);
  const [lock, setLock] = useState<HandLockRow | null>(null);
  const [pendingHands, setPendingHands] = useState<PendingHandRow[]>([]);
  const { playerId, setPlayerId, mounted } = useLocalPlayer(table.code);
  const [formKey, setFormKey] = useState(0);
  const [pending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [queue, setQueue] = useState<QueuedEntry[]>([]);

  useEffect(() => {
    setQueue(readQueue(table.code));
  }, [table.code]);

  useEffect(() => {
    const channel = supabase
      .channel(`table:${table.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `table_id=eq.${table.id}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setPlayers((prev) => removeById(prev, (payload.old as PlayerRow).id));
          } else {
            setPlayers((prev) => upsertById(prev, payload.new as PlayerRow));
          }
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hands', filter: `table_id=eq.${table.id}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setHands((prev) => removeById(prev, (payload.old as HandRow).id));
          } else {
            setHands((prev) =>
              upsertById(prev, payload.new as HandRow).sort((a, b) => a.number - b.number),
            );
          }
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hand_locks', filter: `table_id=eq.${table.id}` },
        (payload) => {
          setLock(payload.eventType === 'DELETE' ? null : (payload.new as HandLockRow));
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pending_hands', filter: `table_id=eq.${table.id}` },
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
  }, [supabase, table.id]);

  const whoAmI = players.find((p) => p.id === playerId) ?? null;

  const chipVal = chipValue({ buyIn: event.buyInDollars, chipsPerBuyIn: event.chipsPerBuyIn });
  const rows = liveStandings(players, event.chipsPerBuyIn, chipVal);
  const balance = liveBalance(players, event.chipsPerBuyIn);

  const pseudoEvent: TonightEvent = {
    id: table.id,
    name: table.name,
    date: '',
    buyIn: event.buyInDollars,
    chipsPerBuyIn: event.chipsPerBuyIn,
    chipsPerPoint: event.chipsPerPoint,
    players: players.map((p) => ({ id: p.id, name: p.name })),
    log: hands.map(handRowToLogEntry),
  };

  const lockIsStale = !lock || Date.now() - new Date(lock.started_at).getTime() > LOCK_STALE_MS;
  const lockedByOther = !!lock && !lockIsStale && lock.entered_by !== whoAmI?.name;

  const lastHand = hands[hands.length - 1];
  const canUndo =
    !!lastHand && Date.now() - new Date(lastHand.created_at).getTime() <= UNDO_WINDOW_MS;

  const nameOf = useCallback(
    (id: string) => players.find((p) => p.id === id)?.name ?? '?',
    [players],
  );

  const handleDraftChange = useCallback(
    (active: boolean) => {
      if (!whoAmI) return;
      if (active) {
        setLockAction({
          accessToken,
          eventId: event.id,
          tableId: table.id,
          enteredBy: whoAmI.name,
          handNumber: hands.length + 1,
        }).catch(() => {
          // Best-effort: the "X is entering..." banner is a nicety, not a guarantee.
        });
      } else {
        clearLockAction({ accessToken, eventId: event.id, tableId: table.id }).catch(() => {});
      }
    },
    [accessToken, event.id, table.id, whoAmI, hands.length],
  );

  // Sends whatever's queued, in order, stopping at the first failure (still offline, most likely).
  const flushQueue = useCallback(async () => {
    for (const entry of readQueue(table.code)) {
      try {
        if (entry.kind === 'hand') {
          await recordHandAction({
            accessToken,
            eventId: event.id,
            tableId: table.id,
            chipsPerPoint: event.chipsPerPoint,
            playerCount: players.length,
            enteredBy: entry.enteredBy,
            input: entry.input,
          });
        } else {
          await recordDrawAction({
            accessToken,
            eventId: event.id,
            tableId: table.id,
            enteredBy: entry.enteredBy,
          });
        }
        setQueue(removeFromQueue(table.code, entry.id));
      } catch {
        break;
      }
    }
  }, [accessToken, event.id, event.chipsPerPoint, table.id, table.code, players.length]);

  useEffect(() => {
    if (online) void flushQueue();
  }, [online, flushQueue]);

  const handleSaveHand = (input: HandInput) => {
    if (!whoAmI) return;
    setSaveError(null);
    const enteredBy = whoAmI.name;
    if (!online) {
      setQueue(
        pushToQueue(table.code, {
          kind: 'hand',
          id: crypto.randomUUID(),
          enteredBy,
          input,
          queuedAt: new Date().toISOString(),
        }),
      );
      setFormKey((k) => k + 1);
      return;
    }
    startTransition(async () => {
      try {
        await recordHandAction({
          accessToken,
          eventId: event.id,
          tableId: table.id,
          chipsPerPoint: event.chipsPerPoint,
          playerCount: players.length,
          enteredBy,
          input,
        });
        setFormKey((k) => k + 1);
      } catch {
        if (!navigator.onLine) {
          setQueue(
            pushToQueue(table.code, {
              kind: 'hand',
              id: crypto.randomUUID(),
              enteredBy,
              input,
              queuedAt: new Date().toISOString(),
            }),
          );
          setFormKey((k) => k + 1);
        } else {
          setSaveError(t('Could not save. Try again.', '저장하지 못했어요. 다시 시도하세요.'));
        }
      }
    });
  };

  const handleSaveDraw = () => {
    if (!whoAmI) return;
    setSaveError(null);
    const enteredBy = whoAmI.name;
    if (!online) {
      setQueue(
        pushToQueue(table.code, {
          kind: 'draw',
          id: crypto.randomUUID(),
          enteredBy,
          queuedAt: new Date().toISOString(),
        }),
      );
      setFormKey((k) => k + 1);
      return;
    }
    startTransition(async () => {
      try {
        await recordDrawAction({ accessToken, eventId: event.id, tableId: table.id, enteredBy });
        setFormKey((k) => k + 1);
      } catch {
        if (!navigator.onLine) {
          setQueue(
            pushToQueue(table.code, {
              kind: 'draw',
              id: crypto.randomUUID(),
              enteredBy,
              queuedAt: new Date().toISOString(),
            }),
          );
          setFormKey((k) => k + 1);
        } else {
          setSaveError(t('Could not save. Try again.', '저장하지 못했어요. 다시 시도하세요.'));
        }
      }
    });
  };

  const handleUndo = () => {
    setSaveError(null);
    startTransition(async () => {
      try {
        await undoHandAction({ accessToken, eventId: event.id, tableId: table.id });
      } catch {
        setSaveError(
          t(
            'Too late to undo — ask the host to fix it.',
            '취소하기엔 너무 늦었어요 — 호스트에게 요청하세요.',
          ),
        );
      }
    });
  };

  if (!mounted) return null;

  if (!whoAmI) {
    return (
      <div className="mx-auto max-w-sm px-5 py-16">
        <h1 className="font-display text-title">{t('Who are you?', '누구세요?')}</h1>
        <p className="mt-2 text-body text-ink-soft">
          {t(
            'Pick your name — this phone will remember it.',
            '이름을 선택하세요 — 이 폰이 기억할게요.',
          )}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {players.map((p) => (
            <button
              key={p.id}
              type="button"
              className="club-chip"
              onClick={() => setPlayerId(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
        {players.length === 0 && (
          <p className="mt-4 text-body text-ink-soft">
            {t(
              'No players at this table yet — ask the host to add you.',
              '아직 이 테이블에 플레이어가 없어요 — 호스트에게 추가해달라고 하세요.',
            )}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-5 py-8 sm:py-10">
      <div>
        <h1 className="font-display text-title">{table.name}</h1>
        <p className="text-label tabular-nums text-ink-soft">
          {t('You are', '나는')} {whoAmI.name} · {t('1 chip', '칩 1개')} = {chipValueText(chipVal)}
        </p>
      </div>

      {!online && (
        <p
          className="rounded-full bg-gold px-3 py-1 text-label font-medium text-on-fill"
          aria-live="polite"
        >
          {t("Offline. Hands will save when you're back.", '오프라인이에요. 연결되면 저장돼요.')}
        </p>
      )}
      {queue.length > 0 && (
        <p
          className="rounded-full bg-gold px-3 py-1 text-label font-medium text-on-fill"
          aria-live="polite"
        >
          {t(
            `${queue.length} hand${queue.length === 1 ? '' : 's'} waiting to save`,
            `${queue.length}판 저장 대기 중`,
          )}
        </p>
      )}

      <div className="club-card space-y-3 p-5 sm:p-6">
        <h2 className="text-sub font-display">{t('Players', '플레이어')}</h2>
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.player.id} className="flex items-center justify-between gap-3">
              <span className="truncate font-medium">{r.player.name}</span>
              <span className="flex items-baseline gap-2 tabular-nums">
                <CountUp value={r.player.chips} className="text-body font-bold" />
                <span className="text-label text-ink-soft">{t('chips', '칩')}</span>
                <span className="text-label text-ink-soft">({signedMoney(r.netDollars)})</span>
              </span>
            </li>
          ))}
        </ul>
        {!balance.ok && (
          <p className="text-label text-ink-soft">
            {t(`Off by ${balance.diff} chips`, `칩 ${balance.diff} 차이`)}
          </p>
        )}
      </div>

      {pendingHands.map((p) => {
        const names = Object.keys(p.payload.shortfalls).map(nameOf).join(', ');
        return (
          <p
            key={p.id}
            className="rounded-full bg-gold px-3 py-1 text-label font-medium text-on-fill"
            aria-live="polite"
          >
            {t(
              `${names} needs to rebuy. Waiting for host.`,
              `${names} 리바이 필요. 호스트 대기 중.`,
            )}
          </p>
        );
      })}

      {lockedByOther && lock && (
        <p
          className="rounded-full bg-gold px-3 py-1 text-label font-medium text-on-fill"
          aria-live="polite"
        >
          {t(
            `${lock.entered_by} is entering hand ${lock.hand_number}`,
            `${lock.entered_by} 님이 ${lock.hand_number}판을 입력 중`,
          )}
        </p>
      )}

      <HandForm
        key={formKey}
        ev={pseudoEvent}
        onCancel={() => setFormKey((k) => k + 1)}
        onSaveHand={handleSaveHand}
        onSaveDraw={handleSaveDraw}
        onDraftChange={handleDraftChange}
      />

      {saveError && (
        <p role="alert" className="text-body text-plum">
          {saveError}
        </p>
      )}

      <div className="club-card space-y-3 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sub font-display">{t('Hand log', '판 기록')}</h2>
          <button
            type="button"
            className="club-btn text-body disabled:cursor-not-allowed disabled:opacity-40"
            onClick={handleUndo}
            disabled={!canUndo || pending}
          >
            {t('Undo last hand', '마지막 판 취소')}
          </button>
        </div>
        <History ev={pseudoEvent} />
      </div>
    </div>
  );
}
