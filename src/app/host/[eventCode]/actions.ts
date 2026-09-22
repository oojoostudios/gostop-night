'use server';

import { revalidatePath } from 'next/cache';
import { getEventByCode } from '@/lib/live/events';
import { createHostSession, isHostSession } from '@/lib/live/host-session';
import { verifyPin } from '@/lib/live/pin';
import { addPlayer, createTable } from '@/lib/live/tables';

export type PinGateState = { error: 'not-found' | 'wrong-pin' | null };

export async function verifyHostPinAction(
  eventCode: string,
  _prevState: PinGateState,
  formData: FormData,
): Promise<PinGateState> {
  const pin = String(formData.get('pin') ?? '').trim();
  const event = await getEventByCode(eventCode);
  if (!event) return { error: 'not-found' };

  const ok = await verifyPin(pin, event.host_pin_hash);
  if (!ok) return { error: 'wrong-pin' };

  await createHostSession(event.code, event.id);
  return { error: null };
}

export type CreateTableState = { error: 'unauthorized' | 'name-required' | null };

export async function createTableAction(
  eventCode: string,
  _prevState: CreateTableState,
  formData: FormData,
): Promise<CreateTableState> {
  const event = await getEventByCode(eventCode);
  if (!event || !(await isHostSession(event.code, event.id))) return { error: 'unauthorized' };

  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { error: 'name-required' };

  await createTable(event.id, name);
  revalidatePath(`/host/${eventCode}`);
  return { error: null };
}

export type AddPlayerState = {
  error: 'unauthorized' | 'name-required' | 'table-required' | null;
};

export async function addPlayerAction(
  eventCode: string,
  _prevState: AddPlayerState,
  formData: FormData,
): Promise<AddPlayerState> {
  const event = await getEventByCode(eventCode);
  if (!event || !(await isHostSession(event.code, event.id))) return { error: 'unauthorized' };

  const name = String(formData.get('name') ?? '').trim();
  const tableId = String(formData.get('tableId') ?? '').trim();
  if (!name) return { error: 'name-required' };
  if (!tableId) return { error: 'table-required' };

  await addPlayer({ eventId: event.id, tableId, name, startingChips: event.chips_per_buy_in });
  revalidatePath(`/host/${eventCode}`);
  return { error: null };
}
