/**
 * Section 07 — Tonight: the data model and the maths for the scorekeeper.
 *
 * Everything here is plain functions, so the payment rules can be tested with other rule values.
 * Every rule (Go bonus, shakes, bombs, bak, Go-bak, draw doubling) comes from src/config/rules.ts.
 * Nothing here handles real money: it counts chips and shows what a chip is worth in dollars.
 */
import { RULES, bakRules, scoreAfterGos, type Rules } from '@/config/rules';

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export type Player = { id: string; name: string };

/** The extra penalties that can be ticked for one loser. */
export type BakFlags = { pi: boolean; gwang: boolean; meong: boolean; goBak: boolean };
export const NO_BAK: BakFlags = { pi: false, gwang: false, meong: false, goBak: false };

export type HandEntry = {
  kind: 'hand';
  id: string;
  at: string;
  winnerId: string;
  points: number;
  gos: number;
  shakes: number;
  bombs: number;
  /** True when the hand before this one was a draw, so this one counted double. */
  afterDraw: boolean;
  losers: Record<string, BakFlags>;
  /** Chips won (+) or lost (−) by each player, frozen when the hand was saved. */
  deltas: Record<string, number>;
};
export type DrawEntry = { kind: 'draw'; id: string; at: string };
export type RebuyEntry = { kind: 'rebuy'; id: string; at: string; playerId: string; chips: number };
export type LogEntry = HandEntry | DrawEntry | RebuyEntry;

export type TonightEvent = {
  id: string;
  name: string;
  /** YYYY-MM-DD */
  date: string;
  /** Dollars for one buy-in. */
  buyIn: number;
  chipsPerBuyIn: number;
  chipsPerPoint: number;
  players: Player[];
  log: LogEntry[];
  finishedAt?: string;
};

/** Everything saved on this phone: the night in progress and the finished ones. */
export type TonightState = { active: TonightEvent | null; past: TonightEvent[] };
export const EMPTY_STATE: TonightState = { active: null, past: [] };

/* -------------------------------------------------------------------------- */
/* Small helpers                                                               */
/* -------------------------------------------------------------------------- */

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/** Dollars for one chip. */
export const chipValue = (ev: Pick<TonightEvent, 'buyIn' | 'chipsPerBuyIn'>) =>
  ev.chipsPerBuyIn > 0 ? ev.buyIn / ev.chipsPerBuyIn : 0;

/** "$12.50", "−$3.00". Rounds to cents unless `decimals` says otherwise. */
export function money(n: number, decimals = 2): string {
  const s = Math.abs(n).toFixed(decimals);
  return (n < 0 && Number(s) !== 0 ? '−$' : '$') + s;
}

/** "+$1.20", "−$0.50", "$0.00". */
export const signedMoney = (n: number) =>
  n > 0 && Number(n.toFixed(2)) !== 0 ? `+${money(n)}` : money(n);

/** The value of one chip, with as many decimals as it needs (at least 2): "$0.10", "$0.333". */
export function chipValueText(value: number): string {
  const trimmed = Number(value.toFixed(4)).toString();
  const decimals = trimmed.includes('.') ? trimmed.split('.')[1].length : 0;
  return '$' + value.toFixed(Math.min(4, Math.max(2, decimals)));
}

/** "+12", "−12", "0". */
export const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0');

/* -------------------------------------------------------------------------- */
/* Standings                                                                   */
/* -------------------------------------------------------------------------- */

export function buyInsOf(ev: TonightEvent, playerId: string): number {
  return 1 + ev.log.filter((e) => e.kind === 'rebuy' && e.playerId === playerId).length;
}

export function chipsOf(ev: TonightEvent, playerId: string): number {
  let chips = ev.chipsPerBuyIn;
  for (const e of ev.log) {
    if (e.kind === 'rebuy' && e.playerId === playerId) chips += e.chips;
    if (e.kind === 'hand') chips += e.deltas[playerId] ?? 0;
  }
  return chips;
}

export type Standing = {
  player: Player;
  buyIns: number;
  bought: number;
  chips: number;
  net: number;
  dollars: number;
  netDollars: number;
};

export function standings(ev: TonightEvent): Standing[] {
  const v = chipValue(ev);
  return ev.players.map((player) => {
    const buyIns = buyInsOf(ev, player.id);
    const bought = buyIns * ev.chipsPerBuyIn;
    const chips = chipsOf(ev, player.id);
    return {
      player,
      buyIns,
      bought,
      chips,
      net: chips - bought,
      dollars: chips * v,
      netDollars: (chips - bought) * v,
    };
  });
}

/** Chips on the table must equal chips bought in. `diff` is what's missing (−) or extra (+). */
export function balance(ev: TonightEvent) {
  const rows = standings(ev);
  const onTable = rows.reduce((sum, r) => sum + r.chips, 0);
  const boughtIn = rows.reduce((sum, r) => sum + r.bought, 0);
  return { onTable, boughtIn, diff: onTable - boughtIn, ok: onTable === boughtIn };
}

/** Whether the next hand counts double: the last hand was a draw (rebuys don't count). */
export function nextHandDoubled(ev: TonightEvent, rules: Rules = RULES): boolean {
  if (!rules.nagariDoubles) return false;
  for (let i = ev.log.length - 1; i >= 0; i--) {
    const e = ev.log[i];
    if (e.kind === 'rebuy') continue;
    return e.kind === 'draw';
  }
  return false;
}

/* -------------------------------------------------------------------------- */
/* Paying for a hand                                                           */
/* -------------------------------------------------------------------------- */

export type HandInput = {
  winnerId: string;
  points: number;
  gos: number;
  shakes: number;
  bombs: number;
  afterDraw: boolean;
  /** One entry per loser. */
  losers: Record<string, BakFlags>;
};

export type LoserCalc = {
  playerId: string;
  /** Which bak penalties count for this loser (only the ones that are on in rules.ts). */
  bak: Array<'pi' | 'gwang' | 'meong'>;
  /** ×2 for each bak. */
  bakFactor: number;
  /** What this loser owes on their own, in chips, before any Go-bak. */
  share: number;
  goBak: boolean;
  /** What this loser actually pays, in chips. */
  pays: number;
};

export type HandCalc = {
  /** Points plus the Go bonus (or the Go multiplier when goScoring is "standard"). */
  afterGos: number;
  shakeFactor: number;
  bombFactor: number;
  drawFactor: number;
  /** afterGos × shake × bomb × draw. */
  score: number;
  chipsPerPoint: number;
  losers: LoserCalc[];
  /** Chips won (+) or lost (−) by each player. Adds up to zero. */
  deltas: Record<string, number>;
  /** What the winner takes. */
  winnerGets: number;
};

/** The multiplier a bak penalty applies. Not in the house-rules list, so it lives here. */
export const BAK_FACTOR = 2;

export function calcHand(
  input: HandInput,
  chipsPerPoint: number,
  playerCount: number,
  rules: Rules = RULES,
): HandCalc {
  const afterGos = scoreAfterGos(input.points, input.gos, rules);
  const shakeFactor = rules.shakeMultiplier ** input.shakes;
  const bombFactor = rules.bombMultiplier ** input.bombs;
  const drawFactor = input.afterDraw && rules.nagariDoubles ? 2 : 1;
  const score = afterGos * shakeFactor * bombFactor * drawFactor;

  const onBak = bakRules(rules);
  const losers: LoserCalc[] = Object.entries(input.losers).map(([playerId, flags]) => {
    const bak = onBak.filter((r) => r.on && flags[r.id]).map((r) => r.id);
    const bakFactor = BAK_FACTOR ** bak.length;
    const share = score * bakFactor * chipsPerPoint;
    const goBak = rules.goBak && flags.goBak;
    return { playerId, bak, bakFactor, share, goBak, pays: share };
  });

  // Go-bak: someone who called Go and lost pays for the table (3 players) or pays double (2 players).
  const goBakers = losers.filter((l) => l.goBak);
  if (goBakers.length > 0) {
    if (playerCount <= 2) {
      for (const l of goBakers) l.pays = l.share * 2;
    } else {
      const pool = losers.reduce((sum, l) => sum + l.share, 0);
      const each = Math.floor(pool / goBakers.length);
      losers.forEach((l) => (l.pays = 0));
      goBakers.forEach((l, i) => (l.pays = each + (i === 0 ? pool - each * goBakers.length : 0)));
    }
  }

  const winnerGets = losers.reduce((sum, l) => sum + l.pays, 0);
  const deltas: Record<string, number> = { [input.winnerId]: winnerGets };
  for (const l of losers) deltas[l.playerId] = -l.pays;
  return {
    afterGos,
    shakeFactor,
    bombFactor,
    drawFactor,
    score,
    chipsPerPoint,
    losers,
    deltas,
    winnerGets,
  };
}

/* -------------------------------------------------------------------------- */
/* Changing the saved state (each returns a new state)                         */
/* -------------------------------------------------------------------------- */

export function startEvent(state: TonightState, ev: TonightEvent): TonightState {
  return { ...state, active: ev };
}

function withLog(state: TonightState, entry: LogEntry): TonightState {
  if (!state.active) return state;
  return { ...state, active: { ...state.active, log: [...state.active.log, entry] } };
}

export function recordHand(
  state: TonightState,
  input: HandInput,
  rules: Rules = RULES,
  at = new Date().toISOString(),
): TonightState {
  const ev = state.active;
  if (!ev) return state;
  const calc = calcHand(input, ev.chipsPerPoint, ev.players.length, rules);
  const entry: HandEntry = {
    kind: 'hand',
    id: newId(),
    at,
    winnerId: input.winnerId,
    points: input.points,
    gos: input.gos,
    shakes: input.shakes,
    bombs: input.bombs,
    afterDraw: input.afterDraw,
    losers: input.losers,
    deltas: calc.deltas,
  };
  return withLog(state, entry);
}

export const recordDraw = (state: TonightState, at = new Date().toISOString()): TonightState =>
  withLog(state, { kind: 'draw', id: newId(), at });

export const rebuy = (
  state: TonightState,
  playerId: string,
  at = new Date().toISOString(),
): TonightState =>
  state.active
    ? withLog(state, {
        kind: 'rebuy',
        id: newId(),
        at,
        playerId,
        chips: state.active.chipsPerBuyIn,
      })
    : state;

/** Takes back the most recent hand or draw. Rebuys stay. */
export function undoLastHand(state: TonightState): TonightState {
  const ev = state.active;
  if (!ev) return state;
  for (let i = ev.log.length - 1; i >= 0; i--) {
    if (ev.log[i].kind !== 'rebuy') {
      return { ...state, active: { ...ev, log: ev.log.filter((_, j) => j !== i) } };
    }
  }
  return state;
}

export const hasHandToUndo = (ev: TonightEvent) => ev.log.some((e) => e.kind !== 'rebuy');

/** Moves the night in progress into the past events. */
export function finishEvent(state: TonightState, at = new Date().toISOString()): TonightState {
  if (!state.active) return state;
  return { active: null, past: [{ ...state.active, finishedAt: at }, ...state.past] };
}

/* -------------------------------------------------------------------------- */
/* CSV export                                                                  */
/* -------------------------------------------------------------------------- */

const cell = (v: string | number) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** The whole night as CSV text: a summary per player, then every hand, draw and rebuy. */
export function eventToCsv(ev: TonightEvent, ko: boolean): string {
  const t = (en: string, kr: string) => (ko ? kr : en);
  const v = chipValue(ev);
  const rows: Array<Array<string | number>> = [];
  rows.push([t('Event', '이벤트'), ev.name]);
  rows.push([t('Date', '날짜'), ev.date]);
  rows.push([t('Buy-in ($)', '바이인($)'), ev.buyIn]);
  rows.push([t('Chips per buy-in', '바이인당 칩'), ev.chipsPerBuyIn]);
  rows.push([t('Chips per point', '점당 칩'), ev.chipsPerPoint]);
  rows.push([t('Value of one chip ($)', '칩 1개 가치($)'), Number(v.toFixed(4))]);
  rows.push([]);
  rows.push([
    t('Player', '플레이어'),
    t('Buy-ins', '바이인 횟수'),
    t('Chips bought', '산 칩'),
    t('Final chips', '최종 칩'),
    t('Net chips', '순 칩'),
    t('Final value ($)', '최종 가치($)'),
    t('Net ($)', '순 손익($)'),
  ]);
  for (const r of standings(ev)) {
    rows.push([
      r.player.name,
      r.buyIns,
      r.bought,
      r.chips,
      r.net,
      Number(r.dollars.toFixed(2)),
      Number(r.netDollars.toFixed(2)),
    ]);
  }
  rows.push([]);
  rows.push([
    '#',
    t('Time', '시간'),
    t('What happened', '내용'),
    t('Winner / player', '승자 / 플레이어'),
    t('Points', '점수'),
    t('Gos', '고'),
    t('Shakes', '흔들기'),
    t('Bombs', '폭탄'),
    ...ev.players.map((p) => `${p.name} (${t('chips', '칩')})`),
  ]);
  const name = (id: string) => ev.players.find((p) => p.id === id)?.name ?? '';
  ev.log.forEach((e, i) => {
    if (e.kind === 'hand') {
      rows.push([
        i + 1,
        e.at,
        t('Hand', '판'),
        name(e.winnerId),
        e.points,
        e.gos,
        e.shakes,
        e.bombs,
        ...ev.players.map((p) => e.deltas[p.id] ?? 0),
      ]);
    } else if (e.kind === 'draw') {
      rows.push([
        i + 1,
        e.at,
        t('Draw (나가리)', '나가리'),
        '',
        '',
        '',
        '',
        '',
        ...ev.players.map(() => 0),
      ]);
    } else {
      rows.push([
        i + 1,
        e.at,
        t('Rebuy', '리바이'),
        name(e.playerId),
        '',
        '',
        '',
        '',
        ...ev.players.map((p) => (p.id === e.playerId ? e.chips : 0)),
      ]);
    }
  });
  // The leading BOM lets Excel read Korean names correctly.
  return '﻿' + rows.map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n';
}

/* -------------------------------------------------------------------------- */
/* Sample night (the /showcase page uses it: demo=1)                            */
/* -------------------------------------------------------------------------- */

/** A finished-looking sample night with made-up players. Built with the same maths as a real one. */
export function buildDemoState(rules: Rules = RULES): TonightState {
  const players: Player[] = [
    { id: 'demo-mina', name: 'Mina' },
    { id: 'demo-jae', name: 'Jae' },
    { id: 'demo-sora', name: 'Sora' },
  ];
  const [mina, jae, sora] = players.map((p) => p.id);
  let state: TonightState = {
    active: {
      id: 'demo',
      name: 'Game night · 게임 나이트',
      date: '2026-01-17',
      buyIn: 10,
      chipsPerBuyIn: 100,
      chipsPerPoint: 1,
      players,
      log: [],
    },
    past: [],
  };
  const at = (n: number) => `2026-01-17T20:${10 + n * 7}:00.000Z`;
  const two = (winnerId: string, points: number, extra: Partial<HandInput> = {}): HandInput => {
    const losers: Record<string, BakFlags> = {};
    for (const p of players) if (p.id !== winnerId) losers[p.id] = { ...NO_BAK };
    return {
      winnerId,
      points,
      gos: 0,
      shakes: 0,
      bombs: 0,
      afterDraw: state.active ? nextHandDoubled(state.active, rules) : false,
      losers,
      ...extra,
    };
  };
  state = recordHand(state, two(mina, 5, { gos: 1 }), rules, at(0));
  state = recordDraw(state, at(1));
  state = recordHand(state, two(jae, 4, { shakes: 1 }), rules, at(2));
  state = rebuy(state, sora, at(3));
  const goBakHand = two(sora, 8, { gos: 2 });
  goBakHand.losers[mina] = { ...NO_BAK, goBak: true };
  state = recordHand(state, goBakHand, rules, at(4));
  state = recordHand(state, two(mina, 3), rules, at(5));
  return state;
}
