import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { PlayerRow } from './types';
import { listHandsForTables } from './hands';

export async function rebuyPlayerLive(
  eventId: string,
  playerId: string,
  chips: number,
): Promise<PlayerRow> {
  const { data, error } = await supabaseAdmin().rpc('rebuy_player', {
    p_player_id: playerId,
    p_event_id: eventId,
    p_chips: chips,
  });
  if (error) throw new Error(error.message);
  return data as PlayerRow;
}

/** A lock this old is treated as abandoned, not an in-progress hand. */
const LOCK_STALE_MS = 5 * 60 * 1000;

/** Moves a player to another table — refused while their current table has a hand in progress. */
export async function movePlayerLive(playerId: string, toTableId: string): Promise<void> {
  const db = supabaseAdmin();
  const { data: player, error: playerError } = await db
    .from('players')
    .select()
    .eq('id', playerId)
    .single();
  if (playerError) throw new Error(playerError.message);
  if (!player.table_id) throw new Error('not-seated');

  const { data: lock, error: lockError } = await db
    .from('hand_locks')
    .select()
    .eq('table_id', player.table_id)
    .maybeSingle();
  if (lockError) throw new Error(lockError.message);
  if (lock && Date.now() - new Date(lock.started_at).getTime() < LOCK_STALE_MS) {
    throw new Error('hand-in-progress');
  }

  const { error } = await db.from('players').update({ table_id: toTableId }).eq('id', playerId);
  if (error) throw new Error(error.message);
}

/** Locks in a player's current chips and removes them from their table's active roster. */
export async function cashOutPlayerLive(playerId: string): Promise<void> {
  const { error } = await supabaseAdmin()
    .from('players')
    .update({ cashed_out: true, table_id: null })
    .eq('id', playerId);
  if (error) throw new Error(error.message);
}

export type RemovePlayerResult = { ok: true } | { ok: false; reason: 'has-activity' };

/**
 * Removing a player added by mistake is only safe when they never actually took part —
 * otherwise their chips are already mixed into other players' totals via hands or a rebuy,
 * and deleting them would silently throw the balance off. Cash out is the right tool then.
 *
 * Returned (not thrown): Next.js redacts thrown Server Function error messages in
 * production, so an expected, explainable outcome like this must come back as a value.
 */
export async function removePlayerLive(playerId: string): Promise<RemovePlayerResult> {
  const db = supabaseAdmin();
  const { data: player, error: playerError } = await db
    .from('players')
    .select('id, event_id, buy_ins')
    .eq('id', playerId)
    .single();
  if (playerError) throw new Error(playerError.message);

  if (player.buy_ins > 1) return { ok: false, reason: 'has-activity' };

  const { data: tables, error: tablesError } = await db
    .from('game_tables')
    .select('id')
    .eq('event_id', player.event_id);
  if (tablesError) throw new Error(tablesError.message);

  const hands = await listHandsForTables((tables ?? []).map((t) => t.id as string));
  const played = hands.some(
    (h) => h.winner_player_id === playerId || Object.hasOwn(h.losers, playerId),
  );
  if (played) return { ok: false, reason: 'has-activity' };

  const { error } = await db.from('players').delete().eq('id', playerId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export type DeleteTableResult = { ok: true } | { ok: false; reason: 'not-empty' };

/** See the note on `removePlayerLive` about returning rather than throwing expected outcomes. */
export async function deleteTableLive(tableId: string): Promise<DeleteTableResult> {
  const db = supabaseAdmin();
  const [{ count: playerCount, error: playerError }, { count: handCount, error: handError }] =
    await Promise.all([
      db.from('players').select('id', { count: 'exact', head: true }).eq('table_id', tableId),
      db.from('hands').select('id', { count: 'exact', head: true }).eq('table_id', tableId),
    ]);
  if (playerError) throw new Error(playerError.message);
  if (handError) throw new Error(handError.message);
  if ((playerCount ?? 0) > 0 || (handCount ?? 0) > 0) return { ok: false, reason: 'not-empty' };

  const { error } = await db.from('game_tables').delete().eq('id', tableId);
  if (error) throw new Error(error.message);
  return { ok: true };
}
