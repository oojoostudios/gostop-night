'use server';

import type { HandInput } from '@/lib/tonight';
import { verifyLiveToken } from '@/lib/live/token';
import {
  clearHandLock,
  recordDrawLive,
  recordHandLive,
  setHandLock,
  undoLastHandLive,
} from '@/lib/live/hands';

/**
 * Every action here is reachable by a direct POST, not just through this page's UI (see the
 * Next.js Server Functions warning). `accessToken` is the proof: it's the token this exact
 * table's page minted server-side, so this checks it names the same table before touching
 * anything — see supabase/migrations/0001_init.sql for the matching RLS side of this.
 */
async function assertPlayerToken(accessToken: string, tableId: string, eventId: string) {
  const claims = await verifyLiveToken(accessToken);
  if (
    claims.gostop_role !== 'player' ||
    claims.table_id !== tableId ||
    claims.event_id !== eventId
  ) {
    throw new Error('unauthorized');
  }
}

export async function recordHandAction(args: {
  accessToken: string;
  eventId: string;
  tableId: string;
  chipsPerPoint: number;
  playerCount: number;
  enteredBy: string;
  input: HandInput;
}) {
  await assertPlayerToken(args.accessToken, args.tableId, args.eventId);
  return recordHandLive({
    eventId: args.eventId,
    tableId: args.tableId,
    chipsPerPoint: args.chipsPerPoint,
    playerCount: args.playerCount,
    enteredBy: args.enteredBy,
    input: args.input,
  });
}

export async function recordDrawAction(args: {
  accessToken: string;
  eventId: string;
  tableId: string;
  enteredBy: string;
}) {
  await assertPlayerToken(args.accessToken, args.tableId, args.eventId);
  return recordDrawLive(args.eventId, args.tableId, args.enteredBy);
}

export async function undoHandAction(args: {
  accessToken: string;
  eventId: string;
  tableId: string;
}) {
  await assertPlayerToken(args.accessToken, args.tableId, args.eventId);
  await undoLastHandLive(args.tableId);
}

export async function setLockAction(args: {
  accessToken: string;
  eventId: string;
  tableId: string;
  enteredBy: string;
  handNumber: number;
}) {
  await assertPlayerToken(args.accessToken, args.tableId, args.eventId);
  await setHandLock(args.tableId, args.enteredBy, args.handNumber);
}

export async function clearLockAction(args: {
  accessToken: string;
  eventId: string;
  tableId: string;
}) {
  await assertPlayerToken(args.accessToken, args.tableId, args.eventId);
  await clearHandLock(args.tableId);
}
