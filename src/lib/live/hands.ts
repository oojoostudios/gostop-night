import 'server-only';
import { RULES } from '@/config/rules';
import { calcHand, type BakFlags, type HandInput } from '@/lib/tonight';
import { supabaseAdmin } from '@/lib/supabase/admin';

export type HandRow = {
  id: string;
  table_id: string;
  number: number;
  is_draw: boolean;
  winner_player_id: string | null;
  points: number | null;
  gos: number;
  shakes: number;
  bombs: number;
  after_draw: boolean;
  go_bak_player_id: string | null;
  losers: Record<string, BakFlags>;
  deltas: Record<string, number>;
  entered_by: string;
  created_at: string;
};

export async function listHandsForTable(tableId: string): Promise<HandRow[]> {
  const { data, error } = await supabaseAdmin()
    .from('hands')
    .select()
    .eq('table_id', tableId)
    .order('number', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as HandRow[];
}

export type RecordHandArgs = {
  eventId: string;
  tableId: string;
  chipsPerPoint: number;
  playerCount: number;
  enteredBy: string;
  input: HandInput;
};

/** Runs the same maths as Stage 1 (`calcHand`), then saves the result atomically. */
export async function recordHandLive(args: RecordHandArgs): Promise<HandRow> {
  const calc = calcHand(args.input, args.chipsPerPoint, args.playerCount, RULES);
  const goBakPlayerId = Object.entries(args.input.losers).find(([, f]) => f.goBak)?.[0] ?? null;

  const { data, error } = await supabaseAdmin().rpc('record_hand', {
    p_table_id: args.tableId,
    p_event_id: args.eventId,
    p_is_draw: false,
    p_winner_player_id: args.input.winnerId,
    p_points: args.input.points,
    p_gos: args.input.gos,
    p_shakes: args.input.shakes,
    p_bombs: args.input.bombs,
    p_after_draw: args.input.afterDraw,
    p_go_bak_player_id: goBakPlayerId,
    p_losers: args.input.losers,
    p_deltas: calc.deltas,
    p_entered_by: args.enteredBy,
  });
  if (error) throw new Error(error.message);
  return data as HandRow;
}

export async function recordDrawLive(
  eventId: string,
  tableId: string,
  enteredBy: string,
): Promise<HandRow> {
  const { data, error } = await supabaseAdmin().rpc('record_hand', {
    p_table_id: tableId,
    p_event_id: eventId,
    p_is_draw: true,
    p_winner_player_id: null,
    p_points: null,
    p_gos: 0,
    p_shakes: 0,
    p_bombs: 0,
    p_after_draw: false,
    p_go_bak_player_id: null,
    p_losers: {},
    p_deltas: {},
    p_entered_by: enteredBy,
  });
  if (error) throw new Error(error.message);
  return data as HandRow;
}

const UNDO_WINDOW_MS = 2 * 60 * 1000;

/** Undoes the most recent hand at this table, but only within 2 minutes of it being saved. */
export async function undoLastHandLive(tableId: string): Promise<void> {
  const { data: last, error: findError } = await supabaseAdmin()
    .from('hands')
    .select()
    .eq('table_id', tableId)
    .order('number', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (findError) throw new Error(findError.message);
  if (!last) return;

  if (Date.now() - new Date(last.created_at).getTime() > UNDO_WINDOW_MS) {
    throw new Error('too-late');
  }

  if (last.is_draw) {
    const { error } = await supabaseAdmin().from('hands').delete().eq('id', last.id);
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await supabaseAdmin().rpc('undo_hand', { p_hand_id: last.id });
  if (error) throw new Error(error.message);
}

/* -------------------------------------------------------------------------- */
/* Hand locks — "Mina is entering hand 7" on the other phones                  */
/* -------------------------------------------------------------------------- */

export async function setHandLock(
  tableId: string,
  enteredBy: string,
  handNumber: number,
): Promise<void> {
  const { error } = await supabaseAdmin()
    .from('hand_locks')
    .upsert({ table_id: tableId, entered_by: enteredBy, hand_number: handNumber });
  if (error) throw new Error(error.message);
}

export async function clearHandLock(tableId: string): Promise<void> {
  const { error } = await supabaseAdmin().from('hand_locks').delete().eq('table_id', tableId);
  if (error) throw new Error(error.message);
}
