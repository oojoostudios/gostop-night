// Pure scoring logic for Go-Stop. Given a set of card IDs the player has
// collected, compute the points and active combos.
//
// What each card type is worth comes from src/config/rules.ts (SCORING), so a
// scoring change is made in one place.
//
// Side effects (피박/광박/멍박/흔들기/고배수) are NOT modeled here — those
// require knowing the round outcome and other players' state.

import { HWATU_DECK, type HwatuType } from '@/lib/hwatu';
import { SCORING } from '@/config/rules';

export const HONGDAN_IDS = ['01-tti', '02-tti', '03-tti'] as const;
export const CHEONGDAN_IDS = ['06-tti', '09-tti', '10-tti'] as const;
export const CHODAN_IDS = ['04-tti', '05-tti', '07-tti'] as const;
export const GODORI_IDS = ['02-kkeut', '04-kkeut', '08-kkeut'] as const;
export const BIGWANG_ID = '12-gwang';
/** September's sake cup (국진 술잔): an Animal OR two junk. The player picks when scoring. */
export const SAKE_CUP_ID = '09-kkeut';

export type Combo = {
  id: 'hongdan' | 'cheongdan' | 'chodan' | 'godori';
  label: string;
  labelKo: string;
  points: number;
};

export type Score = {
  total: number;
  breakdown: Record<HwatuType, number>;
  /** Cards counted toward each type. */
  counts: Record<HwatuType, number>;
  /** Effective pi count after weighting 쌍피 as 2. */
  piEffective: number;
  /** Whether 비광 is among the 광 collected. */
  hasBigwang: boolean;
  combos: Combo[];
};

const COMBOS: ReadonlyArray<{
  id: Combo['id'];
  label: string;
  labelKo: string;
  ids: ReadonlyArray<string>;
  points: number;
}> = [
  {
    id: 'hongdan',
    label: 'Hongdan',
    labelKo: '홍단',
    ids: HONGDAN_IDS,
    points: SCORING.combos.hongdan,
  },
  {
    id: 'cheongdan',
    label: 'Cheongdan',
    labelKo: '청단',
    ids: CHEONGDAN_IDS,
    points: SCORING.combos.cheongdan,
  },
  {
    id: 'chodan',
    label: 'Chodan',
    labelKo: '초단',
    ids: CHODAN_IDS,
    points: SCORING.combos.chodan,
  },
  {
    id: 'godori',
    label: 'Godori',
    labelKo: '고도리',
    ids: GODORI_IDS,
    points: SCORING.combos.godori,
  },
];

export type ScoreOptions = {
  /** Count the September sake cup as two junk instead of an Animal. */
  sakeCupAsJunk?: boolean;
};

export function computeScore(selectedIds: ReadonlySet<string>, options: ScoreOptions = {}): Score {
  const breakdown: Record<HwatuType, number> = { gwang: 0, tti: 0, kkeut: 0, pi: 0 };
  const counts: Record<HwatuType, number> = { gwang: 0, tti: 0, kkeut: 0, pi: 0 };
  let piEffective = 0;
  let hasBigwang = false;

  for (const card of HWATU_DECK) {
    if (!selectedIds.has(card.id)) continue;
    if (card.id === SAKE_CUP_ID && options.sakeCupAsJunk) {
      // Counted as a double junk: one card, worth two.
      counts.pi += 1;
      piEffective += 2;
      continue;
    }
    counts[card.type] += 1;
    if (card.type === 'pi') {
      piEffective += card.tag === '쌍피' ? 2 : 1;
    }
    if (card.id === BIGWANG_ID) hasBigwang = true;
  }

  // 광: 3↑부터 점수, 비광 포함 3광은 2점 (숫자는 rules.ts)
  if (counts.gwang === 5) breakdown.gwang = SCORING.brights.five;
  else if (counts.gwang === 4) breakdown.gwang = SCORING.brights.four;
  else if (counts.gwang === 3) {
    breakdown.gwang = hasBigwang ? SCORING.brights.threeWithRain : SCORING.brights.three;
  }

  // 띠: 정해진 장수부터 1점, 이후 장마다 +1 (12월 띠도 장수에 포함)
  if (counts.tti >= SCORING.ribbonsStartAt)
    breakdown.tti = counts.tti - (SCORING.ribbonsStartAt - 1);

  // 열: 정해진 장수부터 1점, 이후 장마다 +1
  if (counts.kkeut >= SCORING.animalsStartAt) {
    breakdown.kkeut = counts.kkeut - (SCORING.animalsStartAt - 1);
  }

  // 피: 효과 점수(쌍피 = 2)가 정해진 수부터 1점, 이후 +1
  if (piEffective >= SCORING.junkStartAt) breakdown.pi = piEffective - (SCORING.junkStartAt - 1);

  // 콤보: 별도 카운트
  const combos: Combo[] = [];
  for (const combo of COMBOS) {
    const allHeld = combo.ids.every((id) => selectedIds.has(id));
    if (!allHeld) continue;
    combos.push({
      id: combo.id,
      label: combo.label,
      labelKo: combo.labelKo,
      points: combo.points,
    });
    // Combo points add to their type's tally
    if (combo.id === 'godori') breakdown.kkeut += combo.points;
    else breakdown.tti += combo.points;
  }

  const total = breakdown.gwang + breakdown.tti + breakdown.kkeut + breakdown.pi;
  return { total, breakdown, counts, piEffective, hasBigwang, combos };
}
