import 'server-only';
import { SignJWT, jwtVerify } from 'jose';

/**
 * Short-lived tokens the browser uses to read its own table or event straight from
 * Supabase (for Realtime). Signed with the project's JWT secret, so Postgres trusts
 * the `gostop_role` / `event_id` / `table_id` claims the way it would trust a normal
 * Supabase Auth session — see the RLS policies in supabase/migrations/0001_init.sql.
 *
 * There's no Supabase Auth user behind any of this: the "login" is knowing a table
 * code or the host PIN, checked once by server code, which then mints one of these.
 */
export type HostClaims = { gostop_role: 'host'; event_id: string };
export type PlayerClaims = { gostop_role: 'player'; event_id: string; table_id: string };
export type LiveClaims = HostClaims | PlayerClaims;

function secretKey(): Uint8Array {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) throw new Error('SUPABASE_JWT_SECRET must be set.');
  return new TextEncoder().encode(secret);
}

export async function signLiveToken(claims: LiveClaims, expiresIn = '12h'): Promise<string> {
  return new SignJWT({ role: 'authenticated', ...claims })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey());
}

export async function verifyLiveToken(token: string): Promise<LiveClaims> {
  const { payload } = await jwtVerify(token, secretKey());
  if (payload.gostop_role === 'host' && typeof payload.event_id === 'string') {
    return { gostop_role: 'host', event_id: payload.event_id };
  }
  if (
    payload.gostop_role === 'player' &&
    typeof payload.event_id === 'string' &&
    typeof payload.table_id === 'string'
  ) {
    return { gostop_role: 'player', event_id: payload.event_id, table_id: payload.table_id };
  }
  throw new Error('Invalid live-token claims.');
}
