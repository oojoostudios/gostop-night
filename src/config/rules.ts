/**
 * HOUSE RULES — GoStop Club
 *
 * This is the ONE place to change a rule. Change a value here and the whole
 * site follows: the guide sections, the score calculator, and (later) the
 * Tonight scorekeeper. Nothing else in the code should hard-code a threshold,
 * a Go bonus or a penalty.
 */

export type Players = 2 | 3;
export type GoScoring = 'flat' | 'standard';

export type Rules = {
  /** Points needed before a player may call Go or Stop, by number of players at the table. */
  callThreshold: { twoPlayer: number; threePlayer: number };
  /**
   * How Go adds to the score.
   *   "flat"     = +1 point per Go, no doubling
   *   "standard" = +1, +1, then ×2 from the 3rd Go, doubling for each further Go
   */
  goScoring: GoScoring;
  /**
   * Bak: extra payment from a loser who is caught short.
   *   enabled        = master switch. When false, none of the bak rules apply.
   *   piBak          = the loser has fewer than `piBakThreshold` junk (피) cards
   *   gwangBak       = the loser has no Brights (광) at all
   *   meongBak       = the loser has fewer than 5 Animals (열)
   *   piBakThreshold = how few junk cards it takes to be pi-bak
   */
  bakPenalties: {
    enabled: boolean;
    piBak: boolean;
    gwangBak: boolean;
    meongBak: boolean;
    piBakThreshold: number;
  };
  /** A loser who called Go and lost pays for the whole table (3 players); pays double (2 players). */
  goBak: boolean;
  /** ×2 per shake (흔들기). */
  shakeMultiplier: number;
  /** Set to 2 to make bombs (폭탄) double the score. 1 = bombs do not multiply. */
  bombMultiplier: number;
  /** After a drawn hand (나가리), the next hand's score ×2. */
  nagariDoubles: boolean;
};

export const RULES: Rules = {
  callThreshold: { twoPlayer: 7, threePlayer: 3 },
  goScoring: 'standard',
  bakPenalties: {
    enabled: false,
    piBak: true,
    gwangBak: true,
    meongBak: false,
    piBakThreshold: 7,
  },
  goBak: true,
  shakeMultiplier: 2,
  bombMultiplier: 1,
  nagariDoubles: true,
};

/**
 * SCORING — what each kind of card is worth. From the rulings in CLAUDE.md
 * (and standard play for the rest). Kept here so the guide, the calculator and
 * the scorekeeper all agree.
 */
export const SCORING = {
  /** Brights (광). With the Rain bright (비광), three Brights are worth 2, not 3. */
  brights: { three: 3, threeWithRain: 2, four: 4, five: 15 },
  /** Ribbons (띠): this many score 1 point, +1 for each extra. The December ribbon counts toward the total. */
  ribbonsStartAt: 5,
  /** Animals (열): this many score 1 point, +1 for each extra. */
  animalsStartAt: 5,
  /** Junk (피): this many score 1 point, +1 for each extra. Double junk (쌍피) counts as two. */
  junkStartAt: 10,
  /** Combo bonuses. Hongdan, Cheongdan and Chodan are the red, blue and grass ribbon sets. */
  combos: { hongdan: 3, cheongdan: 3, chodan: 3, godori: 5 },
} as const;

// ── Helpers (they take `rules` so they can be tested with other values) ─────

/** Points needed before Go or Stop, for this number of players. */
export const callThreshold = (players: Players, rules: Rules = RULES): number =>
  players === 2 ? rules.callThreshold.twoPlayer : rules.callThreshold.threePlayer;

/** Both thresholds, e.g. "3 / 7" (3 players / 2 players). */
export const callThresholdBoth = (rules: Rules = RULES): string =>
  `${rules.callThreshold.threePlayer} / ${rules.callThreshold.twoPlayer}`;

/**
 * The score after `goCount` Gos, starting from `base` points.
 *   flat:     base + goCount
 *   standard: (base + up to 2) × 2 for the 3rd Go, × 4 for the 4th, ×8 for the 5th ...
 */
export function scoreAfterGos(base: number, goCount: number, rules: Rules = RULES): number {
  if (rules.goScoring === 'flat') return base + goCount;
  const plain = base + Math.min(goCount, 2);
  return goCount >= 3 ? plain * 2 ** (goCount - 2) : plain;
}

export type GoRow = {
  /** 0 = Stop right away, 1 = one Go, ... 4 = "4 or more". */
  goCount: number;
  /** Points added to the score by the Gos so far (flat: +1 each; standard: +1, +1, then none). */
  bonusPoints: number;
  /** What the score is multiplied by (1 when nothing multiplies). */
  multiplier: number;
  /** True for the last row, which stands for "this many Gos or more". */
  orMore?: boolean;
};

/** The rows of the "Go progression" table: Stop, 1-Go, 2-Go, 3-Go, 4-Go or more. */
export function goRows(rules: Rules = RULES): GoRow[] {
  return [0, 1, 2, 3, 4].map((n) => {
    if (rules.goScoring === 'flat') {
      return { goCount: n, bonusPoints: n, multiplier: 1, orMore: n === 4 };
    }
    return {
      goCount: n,
      bonusPoints: Math.min(n, 2),
      multiplier: n >= 3 ? 2 ** (n - 2) : 1,
      orMore: n === 4,
    };
  });
}

export type BakRule = {
  id: 'pi' | 'gwang' | 'meong';
  /** True only when bak is enabled AND this rule is on. */
  on: boolean;
  /** The number the rule turns on (junk for pi-bak, animals for meong-bak). Gwang-bak has none. */
  threshold?: number;
};

/** The three bak rules and whether each one applies at our table. */
export function bakRules(rules: Rules = RULES): BakRule[] {
  const { enabled, piBak, gwangBak, meongBak, piBakThreshold } = rules.bakPenalties;
  return [
    { id: 'pi', on: enabled && piBak, threshold: piBakThreshold },
    { id: 'gwang', on: enabled && gwangBak },
    { id: 'meong', on: enabled && meongBak, threshold: SCORING.animalsStartAt },
  ];
}
