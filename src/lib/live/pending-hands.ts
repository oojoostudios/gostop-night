import 'server-only';
import { RULES } from '@/config/rules';
import { calcHand, type HandInput } from '@/lib/tonight';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getEventById } from './events';
import { rebuyPlayerLive } from './host-actions';
import { recordHandLive, type HandRow } from './hands';

export type PendingPayload = {
  winnerId: string;
  points: number;
  gos: number;
  shakes: number;
  bombs: number;
  afterDraw: boolean;
  losers: HandInput['losers'];
  chipsPerPoint: number;
  playerCount: number;
  /** playerId → chips still missing to cover what they owe. */
  shortfalls: Record<string, number>;
};

export type PendingHandRow = {
  id: string;
  table_id: string;
  event_id: string;
  payload: PendingPayload;
  entered_by: string;
  created_at: string;
};

export async function listPendingHandsForTable(tableId: string): Promise<PendingHandRow[]> {
  const { data, error } = await supabaseAdmin()
    .from('pending_hands')
    .select()
    .eq('table_id', tableId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as PendingHandRow[];
}

/** Every pending hand across a set of tables — used by the host overview. */
export async function listPendingHandsForTables(tableIds: string[]): Promise<PendingHandRow[]> {
  if (tableIds.length === 0) return [];
  const { data, error } = await supabaseAdmin()
    .from('pending_hands')
    .select()
    .in('table_id', tableIds)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as PendingHandRow[];
}

export type RecordAttempt = { kind: 'saved'; hand: HandRow } | { kind: 'pending' };

export type TryRecordHandArgs = {
  eventId: string;
  tableId: string;
  chipsPerPoint: number;
  playerCount: number;
  enteredBy: string;
  input: HandInput;
};

/**
 * Tries to save a hand. If a loser doesn't have enough chips to cover what they'd owe, the
 * hand is parked in `pending_hands` instead — see supabase/migrations/0005_pending_hands.sql.
 * Chips never go below zero because of this check, not because of anything in the UI.
 */
export async function tryRecordHandLive(args: TryRecordHandArgs): Promise<RecordAttempt> {
  const calc = calcHand(args.input, args.chipsPerPoint, args.playerCount, RULES);
  const loserIds = Object.keys(args.input.losers);

  const { data: loserRows, error } = await supabaseAdmin()
    .from('players')
    .select('id, chips')
    .in('id', loserIds);
  if (error) throw new Error(error.message);
  const chipsById = new Map((loserRows ?? []).map((p) => [p.id as string, p.chips as number]));

  const shortfalls: Record<string, number> = {};
  for (const [playerId, delta] of Object.entries(calc.deltas)) {
    if (delta >= 0) continue;
    const current = chipsById.get(playerId) ?? 0;
    if (current + delta < 0) shortfalls[playerId] = -(current + delta);
  }

  if (Object.keys(shortfalls).length === 0) {
    const hand = await recordHandLive(args);
    return { kind: 'saved', hand };
  }

  const payload: PendingPayload = {
    winnerId: args.input.winnerId,
    points: args.input.points,
    gos: args.input.gos,
    shakes: args.input.shakes,
    bombs: args.input.bombs,
    afterDraw: args.input.afterDraw,
    losers: args.input.losers,
    chipsPerPoint: args.chipsPerPoint,
    playerCount: args.playerCount,
    shortfalls,
  };
  const { error: insertError } = await supabaseAdmin().from('pending_hands').insert({
    table_id: args.tableId,
    event_id: args.eventId,
    entered_by: args.enteredBy,
    payload,
  });
  if (insertError) throw new Error(insertError.message);
  return { kind: 'pending' };
}

/** The host confirms: rebuy each short player enough to cover it, then save the hand for real. */
export async function resolvePendingHandLive(pendingId: string): Promise<HandRow> {
  const db = supabaseAdmin();
  const { data, error } = await db.from('pending_hands').select().eq('id', pendingId).single();
  if (error) throw new Error(error.message);
  const pending = data as PendingHandRow;

  const event = await getEventById(pending.event_id);
  if (!event) throw new Error('Event not found');

  for (const [playerId, shortfall] of Object.entries(pending.payload.shortfalls)) {
    const rebuysNeeded = Math.ceil(shortfall / event.chips_per_buy_in);
    for (let i = 0; i < rebuysNeeded; i++) {
      await rebuyPlayerLive(pending.event_id, playerId, event.chips_per_buy_in);
    }
  }

  const hand = await recordHandLive({
    eventId: pending.event_id,
    tableId: pending.table_id,
    chipsPerPoint: pending.payload.chipsPerPoint,
    playerCount: pending.payload.playerCount,
    enteredBy: pending.entered_by,
    input: {
      winnerId: pending.payload.winnerId,
      points: pending.payload.points,
      gos: pending.payload.gos,
      shakes: pending.payload.shakes,
      bombs: pending.payload.bombs,
      afterDraw: pending.payload.afterDraw,
      losers: pending.payload.losers,
    },
  });

  const { error: deleteError } = await db.from('pending_hands').delete().eq('id', pending.id);
  if (deleteError) throw new Error(deleteError.message);
  return hand;
}
