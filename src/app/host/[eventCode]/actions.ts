'use server';

import { revalidatePath } from 'next/cache';
import { getEventByCode } from '@/lib/live/events';
import { createHostSession, isHostSession } from '@/lib/live/host-session';
import { verifyPin } from '@/lib/live/pin';
import { addPlayer, createTable } from '@/lib/live/tables';
import { cashOutPlayerLive, movePlayerLive, rebuyPlayerLive } from '@/lib/live/host-actions';
import { resolvePendingHandLive } from '@/lib/live/pending-hands';

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

/**
 * Rebuy, move, and cash-out are single-button actions (no form), so unlike the ones above
 * they just throw on failure — the host dashboard's Realtime subscription reflects a success
 * on its own, without a revalidate.
 */
async function requireHost(eventCode: string) {
  const event = await getEventByCode(eventCode);
  if (!event || !(await isHostSession(event.code, event.id))) throw new Error('unauthorized');
  return event;
}

export async function rebuyAction(eventCode: string, playerId: string): Promise<void> {
  const event = await requireHost(eventCode);
  await rebuyPlayerLive(event.id, playerId, event.chips_per_buy_in);
}

export async function movePlayerAction(
  eventCode: string,
  playerId: string,
  toTableId: string,
): Promise<void> {
  await requireHost(eventCode);
  await movePlayerLive(playerId, toTableId);
}

export async function cashOutPlayerAction(eventCode: string, playerId: string): Promise<void> {
  await requireHost(eventCode);
  await cashOutPlayerLive(playerId);
}

export async function resolvePendingHandAction(
  eventCode: string,
  pendingId: string,
): Promise<void> {
  await requireHost(eventCode);
  await resolvePendingHandLive(pendingId);
}
