'use server';

import { redirect } from 'next/navigation';
import { createEvent } from '@/lib/live/events';
import { createHostSession } from '@/lib/live/host-session';
import { isValidPinFormat } from '@/lib/live/pin';

export type CreateEventState = {
  error:
    | 'date-required'
    | 'buy-in-invalid'
    | 'chips-invalid'
    | 'pin-invalid'
    | 'pin-mismatch'
    | null;
};

export async function createEventAction(
  _prevState: CreateEventState,
  formData: FormData,
): Promise<CreateEventState> {
  const name = String(formData.get('name') ?? '').trim();
  const date = String(formData.get('date') ?? '').trim();
  const buyIn = Number(formData.get('buyIn'));
  const chipsPerBuyIn = Number(formData.get('chipsPerBuyIn'));
  const chipsPerPoint = Number(formData.get('chipsPerPoint'));
  const pin = String(formData.get('pin') ?? '').trim();
  const confirmPin = String(formData.get('confirmPin') ?? '').trim();

  if (!date) return { error: 'date-required' };
  if (!Number.isFinite(buyIn) || buyIn <= 0) return { error: 'buy-in-invalid' };
  if (!Number.isInteger(chipsPerBuyIn) || chipsPerBuyIn < 1) return { error: 'chips-invalid' };
  if (!Number.isInteger(chipsPerPoint) || chipsPerPoint < 1) return { error: 'chips-invalid' };
  if (!isValidPinFormat(pin)) return { error: 'pin-invalid' };
  if (pin !== confirmPin) return { error: 'pin-mismatch' };

  const event = await createEvent({
    name: name || 'Game night',
    date,
    buyInDollars: buyIn,
    chipsPerBuyIn,
    chipsPerPoint,
    pin,
  });
  await createHostSession(event.code, event.id);
  redirect(`/host/${event.code}`);
}
