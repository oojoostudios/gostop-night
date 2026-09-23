import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { randomCode } from './codes';
import { hashPin } from './pin';
import type { EventRow } from './types';

export type NewEventInput = {
  name: string;
  date: string;
  buyInDollars: number;
  chipsPerBuyIn: number;
  chipsPerPoint: number;
  pin: string;
};

/** Creates the event row, retrying on the rare event-code collision. */
export async function createEvent(input: NewEventInput): Promise<EventRow> {
  const hostPinHash = await hashPin(input.pin);
  const db = supabaseAdmin();

  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await db
      .from('events')
      .insert({
        code: randomCode(),
        name: input.name,
        date: input.date,
        buy_in_dollars: input.buyInDollars,
        chips_per_buy_in: input.chipsPerBuyIn,
        chips_per_point: input.chipsPerPoint,
        host_pin_hash: hostPinHash,
      })
      .select()
      .single();

    if (!error) return data as EventRow;
    // 23505 = unique_violation. Only retry that; anything else is a real failure.
    if (error.code !== '23505') throw new Error(error.message);
  }
  throw new Error('Could not generate a free event code. Please try again.');
}

export async function getEventByCode(code: string): Promise<EventRow | null> {
  const { data, error } = await supabaseAdmin()
    .from('events')
    .select()
    .eq('code', code.toUpperCase())
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as EventRow | null;
}

export async function getEventById(id: string): Promise<EventRow | null> {
  const { data, error } = await supabaseAdmin().from('events').select().eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as EventRow | null;
}

/** `EventRow` without the PIN hash — the shape that's safe to pass to a Client Component. */
export type PublicEvent = Omit<EventRow, 'host_pin_hash'>;

export function toPublicEvent(event: EventRow): PublicEvent {
  const {
    id,
    code,
    name,
    date,
    buy_in_dollars,
    chips_per_buy_in,
    chips_per_point,
    status,
    created_at,
  } = event;
  return {
    id,
    code,
    name,
    date,
    buy_in_dollars,
    chips_per_buy_in,
    chips_per_point,
    status,
    created_at,
  };
}
