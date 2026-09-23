import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { randomCode } from './codes';
import type { PlayerRow, TableRow } from './types';

/** Creates the table row, retrying on the rare table-code collision. */
export async function createTable(eventId: string, name: string): Promise<TableRow> {
  const db = supabaseAdmin();
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await db
      .from('game_tables')
      .insert({ event_id: eventId, code: randomCode(), name })
      .select()
      .single();
    if (!error) return data as TableRow;
    if (error.code !== '23505') throw new Error(error.message);
  }
  throw new Error('Could not generate a free table code. Please try again.');
}

export async function getTableByCode(code: string): Promise<TableRow | null> {
  const { data, error } = await supabaseAdmin()
    .from('game_tables')
    .select()
    .eq('code', code.toUpperCase())
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as TableRow | null;
}

export async function listTablesForEvent(eventId: string): Promise<TableRow[]> {
  const { data, error } = await supabaseAdmin()
    .from('game_tables')
    .select()
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as TableRow[];
}

export async function listPlayersForEvent(eventId: string): Promise<PlayerRow[]> {
  const { data, error } = await supabaseAdmin()
    .from('players')
    .select()
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as PlayerRow[];
}

export async function listPlayersForTable(tableId: string): Promise<PlayerRow[]> {
  const { data, error } = await supabaseAdmin()
    .from('players')
    .select()
    .eq('table_id', tableId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as PlayerRow[];
}

export type NewPlayerInput = {
  eventId: string;
  tableId: string;
  name: string;
  startingChips: number;
};

export async function addPlayer(input: NewPlayerInput): Promise<PlayerRow> {
  const { data, error } = await supabaseAdmin()
    .from('players')
    .insert({
      event_id: input.eventId,
      table_id: input.tableId,
      name: input.name,
      buy_ins: 1,
      chips: input.startingChips,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as PlayerRow;
}
