import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { PlayerRow } from './types';

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
