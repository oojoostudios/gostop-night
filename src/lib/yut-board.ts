// Yutnori board layout. 29 stations arranged on a 6×6 conceptual grid plus
// two diagonals through the center.
//
// Coordinates are in SVG units, viewBox 0 0 600 600. Origin is top-left,
// y increases downward.

export type StationKind = 'start' | 'corner' | 'outer' | 'diagonal' | 'center';

export type Station = {
  id: string;
  x: number;
  y: number;
  kind: StationKind;
  nameKo?: string;
  nameEn?: string;
};

// Outer ring: 5 step intervals along each side of a 500×500 inner square,
// inset 50px from the SVG edge. So stations sit at multiples of 100.
const O = 50;
const G = 100;

export const STATIONS: ReadonlyArray<Station> = [
  // Start (SE corner — bottom-right) and counterclockwise outer ring.
  { id: 'start', x: O + 5 * G, y: O + 5 * G, kind: 'start', nameKo: '출발', nameEn: 'Start' },

  // Bottom row, going left toward SW.
  { id: 'o-b1', x: O + 4 * G, y: O + 5 * G, kind: 'outer' },
  { id: 'o-b2', x: O + 3 * G, y: O + 5 * G, kind: 'outer' },
  { id: 'o-b3', x: O + 2 * G, y: O + 5 * G, kind: 'outer' },
  { id: 'o-b4', x: O + 1 * G, y: O + 5 * G, kind: 'outer' },

  { id: 'sw', x: O, y: O + 5 * G, kind: 'corner', nameKo: '첫모', nameEn: 'Corner' },

  // Left column, going up toward NW.
  { id: 'o-l1', x: O, y: O + 4 * G, kind: 'outer' },
  { id: 'o-l2', x: O, y: O + 3 * G, kind: 'outer' },
  { id: 'o-l3', x: O, y: O + 2 * G, kind: 'outer' },
  { id: 'o-l4', x: O, y: O + 1 * G, kind: 'outer' },

  { id: 'nw', x: O, y: O, kind: 'corner', nameKo: '둘모', nameEn: 'Corner' },

  // Top row, going right toward NE.
  { id: 'o-t1', x: O + 1 * G, y: O, kind: 'outer' },
  { id: 'o-t2', x: O + 2 * G, y: O, kind: 'outer' },
  { id: 'o-t3', x: O + 3 * G, y: O, kind: 'outer' },
  { id: 'o-t4', x: O + 4 * G, y: O, kind: 'outer' },

  { id: 'ne', x: O + 5 * G, y: O, kind: 'corner', nameKo: '셋모', nameEn: 'Corner' },

  // Right column, going down toward start.
  { id: 'o-r1', x: O + 5 * G, y: O + 1 * G, kind: 'outer' },
  { id: 'o-r2', x: O + 5 * G, y: O + 2 * G, kind: 'outer' },
  { id: 'o-r3', x: O + 5 * G, y: O + 3 * G, kind: 'outer' },
  { id: 'o-r4', x: O + 5 * G, y: O + 4 * G, kind: 'outer' },

  // NE-SW diagonal interior stations.
  { id: 'ne-d1', x: O + 4.17 * G, y: O + 0.83 * G, kind: 'diagonal' },
  { id: 'ne-d2', x: O + 3.33 * G, y: O + 1.67 * G, kind: 'diagonal' },
  { id: 'sw-d1', x: O + 1.67 * G, y: O + 3.33 * G, kind: 'diagonal' },
  { id: 'sw-d2', x: O + 0.83 * G, y: O + 4.17 * G, kind: 'diagonal' },

  // NW-SE diagonal interior stations.
  { id: 'nw-d1', x: O + 0.83 * G, y: O + 0.83 * G, kind: 'diagonal' },
  { id: 'nw-d2', x: O + 1.67 * G, y: O + 1.67 * G, kind: 'diagonal' },
  { id: 'se-d1', x: O + 3.33 * G, y: O + 3.33 * G, kind: 'diagonal' },
  { id: 'se-d2', x: O + 4.17 * G, y: O + 4.17 * G, kind: 'diagonal' },

  // Shared center.
  {
    id: 'center',
    x: O + 2.5 * G,
    y: O + 2.5 * G,
    kind: 'center',
    nameKo: '방여',
    nameEn: 'Center',
  },
];

/** Lookup helper. */
export function getStation(id: string): Station {
  const s = STATIONS.find((st) => st.id === id);
  if (!s) throw new Error(`Unknown station: ${id}`);
  return s;
}

/** Outer ring traversal order, starting and ending at "start" — counterclockwise.
 * From start (SE corner): up the right column → top row leftward → down the
 * left column → bottom row rightward → home. */
export const OUTER_PATH: ReadonlyArray<string> = [
  'start',
  'o-r4',
  'o-r3',
  'o-r2',
  'o-r1',
  'ne',
  'o-t4',
  'o-t3',
  'o-t2',
  'o-t1',
  'nw',
  'o-l4',
  'o-l3',
  'o-l2',
  'o-l1',
  'sw',
  'o-b4',
  'o-b3',
  'o-b2',
  'o-b1',
  'start',
];

/** The two cross-board shortcuts, each from one corner through center to another. */
export const SHORTCUTS: ReadonlyArray<ReadonlyArray<string>> = [
  ['ne', 'ne-d1', 'ne-d2', 'center', 'sw-d1', 'sw-d2', 'sw'],
  ['nw', 'nw-d1', 'nw-d2', 'center', 'se-d1', 'se-d2', 'start'],
];

/** All 4 corners (excluding start, which is also a corner). */
export const CORNERS: ReadonlyArray<string> = ['sw', 'nw', 'ne'];

/** Outer ring next-station map. start → o-b1 → ... → o-r4 → start. */
export const OUTER_NEXT: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (let i = 0; i < OUTER_PATH.length - 1; i++) {
    if (!(OUTER_PATH[i] in m)) m[OUTER_PATH[i]] = OUTER_PATH[i + 1];
  }
  return m;
})();

/** Shortcuts taken when landing exactly on a corner. Each list excludes the
 * corner itself and includes the destination corner as the last entry. */
export const SHORTCUT_FROM: Record<string, ReadonlyArray<string>> = {
  ne: ['ne-d1', 'ne-d2', 'center', 'sw-d1', 'sw-d2', 'sw'],
  nw: ['nw-d1', 'nw-d2', 'center', 'se-d1', 'se-d2', 'start'],
};
