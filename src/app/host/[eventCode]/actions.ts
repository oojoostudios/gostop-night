'use server';

import { getEventByCode } from '@/lib/live/events';
import { createHostSession } from '@/lib/live/host-session';
import { verifyPin } from '@/lib/live/pin';

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
