import 'server-only';
import { cookies } from 'next/headers';
import { signLiveToken, verifyLiveToken } from './token';

/** One cookie per event, so the host can have more than one night remembered at once. */
const cookieName = (eventCode: string) => `gostop_host_${eventCode}`;

const THIRTY_DAYS = 60 * 60 * 24 * 30;

/**
 * Remembers the host as authenticated for this one event, on this one browser.
 * Call only from a Server Action or Route Handler (Next.js can't set cookies elsewhere).
 */
export async function createHostSession(eventCode: string, eventId: string): Promise<void> {
  const token = await signLiveToken({ gostop_role: 'host', event_id: eventId }, '30d');
  const store = await cookies();
  store.set(cookieName(eventCode), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: THIRTY_DAYS,
  });
}

/** True if this browser is already remembered as the host of this exact event. */
export async function isHostSession(eventCode: string, eventId: string): Promise<boolean> {
  const store = await cookies();
  const token = store.get(cookieName(eventCode))?.value;
  if (!token) return false;
  try {
    const claims = await verifyLiveToken(token);
    return claims.gostop_role === 'host' && claims.event_id === eventId;
  } catch {
    return false;
  }
}
