import type { HandInput } from '@/lib/tonight';

/**
 * A hand entered while offline, saved on this phone until the connection returns.
 * "Never lose an entered hand silently" — see CLAUDE.md's Stage 2 offline rule.
 */
export type QueuedEntry =
  | { kind: 'hand'; id: string; enteredBy: string; input: HandInput; queuedAt: string }
  | { kind: 'draw'; id: string; enteredBy: string; queuedAt: string };

const storageKey = (tableCode: string) => `gostop:live:queue:${tableCode}`;

export function readQueue(tableCode: string): QueuedEntry[] {
  try {
    const raw = window.localStorage.getItem(storageKey(tableCode));
    return raw ? (JSON.parse(raw) as QueuedEntry[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(tableCode: string, queue: QueuedEntry[]) {
  try {
    window.localStorage.setItem(storageKey(tableCode), JSON.stringify(queue));
  } catch {
    // The queue is best-effort: if storage is unavailable, there's nothing more to do here.
  }
}

export function pushToQueue(tableCode: string, entry: QueuedEntry): QueuedEntry[] {
  const next = [...readQueue(tableCode), entry];
  writeQueue(tableCode, next);
  return next;
}

export function removeFromQueue(tableCode: string, id: string): QueuedEntry[] {
  const next = readQueue(tableCode).filter((e) => e.id !== id);
  writeQueue(tableCode, next);
  return next;
}
