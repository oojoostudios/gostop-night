// Pure scoring logic for Go-Stop. Given a set of card IDs the player has
// collected, compute the points and active combos.
//
// Standard 3-player ruleset.
// Side effects (피박/광박/멍박/흔들기/고배수) are NOT modeled here — those
// require knowing the round outcome and other players' state.

import { HWATU_DECK, type HwatuType } from "@/lib/hwatu";

export const HONGDAN_IDS = ["01-tti", "02-tti", "03-tti"] as const;
export const CHEONGDAN_IDS = ["06-tti", "09-tti", "10-tti"] as const;
export const CHODAN_IDS = ["04-tti", "05-tti", "07-tti"] as const;
export const GODORI_IDS = ["02-kkeut", "04-kkeut", "08-kkeut"] as const;
export const BIGWANG_ID = "12-gwang";

export type Combo = {
  id: "hongdan" | "cheongdan" | "chodan" | "godori";
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
  id: Combo["id"];
  label: string;
  labelKo: string;
  ids: ReadonlyArray<string>;
  points: number;
}> = [
  { id: "hongdan",   label: "Hongdan",   labelKo: "홍단",   ids: HONGDAN_IDS,   points: 3 },
  { id: "cheongdan", label: "Cheongdan", labelKo: "청단",   ids: CHEONGDAN_IDS, points: 3 },
  { id: "chodan",    label: "Chodan",    labelKo: "초단",   ids: CHODAN_IDS,    points: 3 },
  { id: "godori",    label: "Godori",    labelKo: "고도리", ids: GODORI_IDS,    points: 5 },
];

export function computeScore(selectedIds: ReadonlySet<string>): Score {
  const breakdown: Record<HwatuType, number> = { gwang: 0, tti: 0, kkeut: 0, pi: 0 };
  const counts: Record<HwatuType, number> = { gwang: 0, tti: 0, kkeut: 0, pi: 0 };
  let piEffective = 0;
  let hasBigwang = false;

  for (const card of HWATU_DECK) {
    if (!selectedIds.has(card.id)) continue;
    counts[card.type] += 1;
    if (card.type === "pi") {
      piEffective += card.tag === "쌍피" ? 2 : 1;
    }
    if (card.id === BIGWANG_ID) hasBigwang = true;
  }

  // 광: 3↑부터 점수, 비광 포함 3광은 2점
  if (counts.gwang === 5) breakdown.gwang = 15;
  else if (counts.gwang === 4) breakdown.gwang = 4;
  else if (counts.gwang === 3) breakdown.gwang = hasBigwang ? 2 : 3;

  // 띠: 5장↑부터 점수 (5장 = 1점, 이후 +1)
  if (counts.tti >= 5) breakdown.tti = counts.tti - 4;

  // 끗: 5장↑부터 점수 (5장 = 1점, 이후 +1)
  if (counts.kkeut >= 5) breakdown.kkeut = counts.kkeut - 4;

  // 피: 효과 점수 10↑부터 점수 (10 = 1점, 이후 +1)
  if (piEffective >= 10) breakdown.pi = piEffective - 9;

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
    if (combo.id === "godori") breakdown.kkeut += combo.points;
    else breakdown.tti += combo.points;
  }

  const total = breakdown.gwang + breakdown.tti + breakdown.kkeut + breakdown.pi;
  return { total, breakdown, counts, piEffective, hasBigwang, combos };
}
