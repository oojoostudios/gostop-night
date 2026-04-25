export type HwatuType = "gwang" | "tti" | "kkeut" | "pi";

export type HwatuCard = {
  id: string;
  month: number;
  type: HwatuType;
  /** Specific name of the card (e.g. "송학" / "Pine and crane") */
  name: string;
  nameKo: string;
  /** Special tag rendered on the card face, if any (e.g. "쌍피", "비광") */
  tag?: string;
  tagKo?: string;
  /** Path to the rendered card image (PNG sliced from the master deck SVG). */
  image: string;
};

export type Month = {
  num: number;
  motif: string;
  motifKo: string;
};

export const MONTHS: ReadonlyArray<Month> = [
  { num: 1,  motif: "Pine & crane",       motifKo: "송학" },
  { num: 2,  motif: "Plum & warbler",     motifKo: "매조" },
  { num: 3,  motif: "Cherry blossom",     motifKo: "벚꽃" },
  { num: 4,  motif: "Black bush clover",  motifKo: "흑싸리" },
  { num: 5,  motif: "Orchid",             motifKo: "난초" },
  { num: 6,  motif: "Peony",              motifKo: "모란" },
  { num: 7,  motif: "Red bush clover",    motifKo: "홍싸리" },
  { num: 8,  motif: "Pampas & moon",      motifKo: "공산명월" },
  { num: 9,  motif: "Chrysanthemum",      motifKo: "국화" },
  { num: 10, motif: "Maple",              motifKo: "단풍" },
  { num: 11, motif: "Paulownia",          motifKo: "오동" },
  { num: 12, motif: "Rain & willow",      motifKo: "비" },
];

export const HWATU_TYPES: Record<HwatuType, { label: string; labelKo: string; blurb: string; blurbKo: string }> = {
  gwang: {
    label: "Bright",
    labelKo: "광",
    blurb: "The five most prestigious cards. Collect three or more to score.",
    blurbKo: "다섯 장의 가장 귀한 카드. 3장 이상 모으면 점수가 됩니다.",
  },
  tti: {
    label: "Ribbon",
    labelKo: "띠",
    blurb: "Cards with red, blue, or grass-colored ribbons. Sets of three score extra.",
    blurbKo: "빨강·파랑·초록 띠가 있는 카드. 세 장 한 세트로 점수가 됩니다.",
  },
  kkeut: {
    label: "Animal",
    labelKo: "끗 (열끗)",
    blurb: "Cards depicting animals. Ten of these scores one point.",
    blurbKo: "동물이 그려진 카드. 10장 모으면 1점.",
  },
  pi: {
    label: "Pip",
    labelKo: "피",
    blurb: "Plain cards. Ten scores one point; doubles (쌍피) count as two.",
    blurbKo: "일반 카드. 10장에 1점, 쌍피는 두 장으로 셉니다.",
  },
};

/**
 * Standard 48-card hwatu deck. 5 광, 10 띠, 9 끗, 24 피.
 *
 * Image paths are sliced from `/public/hwatu-deck.svg` (3000×3300 viewBox)
 * into 8 cols × 6 rows. Within each row, cols 0–3 are the month listed first,
 * cols 4–7 are that month + 6. Within each month's four slots the order is
 * highest-tier first (광 if it exists, else 끗), then 띠, then pi/쌍피.
 */
export const HWATU_DECK: ReadonlyArray<HwatuCard> = [
  // 1월 — 송학 (row 0, cols 0–3)
  { id: "01-gwang", month: 1, type: "gwang", name: "Pine bright", nameKo: "송학광", image: "/cards/cell-r0-c0.png" },
  { id: "01-tti",   month: 1, type: "tti",   name: "Red ribbon",  nameKo: "홍단", tag: "홍단", tagKo: "홍단", image: "/cards/cell-r0-c1.png" },
  { id: "01-pi-1",  month: 1, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r0-c2.png" },
  { id: "01-pi-2",  month: 1, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r0-c3.png" },

  // 2월 — 매조 (row 1, cols 0–3)
  { id: "02-kkeut", month: 2, type: "kkeut", name: "Warbler",     nameKo: "매조 (휘파람새)", image: "/cards/cell-r1-c0.png" },
  { id: "02-tti",   month: 2, type: "tti",   name: "Red ribbon",  nameKo: "홍단", tag: "홍단", tagKo: "홍단", image: "/cards/cell-r1-c1.png" },
  { id: "02-pi-1",  month: 2, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r1-c2.png" },
  { id: "02-pi-2",  month: 2, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r1-c3.png" },

  // 3월 — 벚꽃 (row 2, cols 0–3)
  { id: "03-gwang", month: 3, type: "gwang", name: "Cherry bright", nameKo: "벚꽃광", image: "/cards/cell-r2-c0.png" },
  { id: "03-tti",   month: 3, type: "tti",   name: "Red poetry ribbon", nameKo: "홍단", tag: "홍단", tagKo: "홍단", image: "/cards/cell-r2-c1.png" },
  { id: "03-pi-1",  month: 3, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r2-c2.png" },
  { id: "03-pi-2",  month: 3, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r2-c3.png" },

  // 4월 — 흑싸리 (row 3, cols 0–3)
  { id: "04-kkeut", month: 4, type: "kkeut", name: "Cuckoo",      nameKo: "두견새", image: "/cards/cell-r3-c0.png" },
  { id: "04-tti",   month: 4, type: "tti",   name: "Grass ribbon", nameKo: "초단", tag: "초단", tagKo: "초단", image: "/cards/cell-r3-c1.png" },
  { id: "04-pi-1",  month: 4, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r3-c2.png" },
  { id: "04-pi-2",  month: 4, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r3-c3.png" },

  // 5월 — 난초 (row 4, cols 0–3)
  { id: "05-kkeut", month: 5, type: "kkeut", name: "Bridge",      nameKo: "다리", image: "/cards/cell-r4-c0.png" },
  { id: "05-tti",   month: 5, type: "tti",   name: "Grass ribbon", nameKo: "초단", tag: "초단", tagKo: "초단", image: "/cards/cell-r4-c1.png" },
  { id: "05-pi-1",  month: 5, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r4-c2.png" },
  { id: "05-pi-2",  month: 5, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r4-c3.png" },

  // 6월 — 모란 (row 5, cols 0–3)
  { id: "06-kkeut", month: 6, type: "kkeut", name: "Butterfly",   nameKo: "나비", image: "/cards/cell-r5-c0.png" },
  { id: "06-tti",   month: 6, type: "tti",   name: "Blue ribbon", nameKo: "청단", tag: "청단", tagKo: "청단", image: "/cards/cell-r5-c1.png" },
  { id: "06-pi-1",  month: 6, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r5-c2.png" },
  { id: "06-pi-2",  month: 6, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r5-c3.png" },

  // 7월 — 홍싸리 (row 0, cols 4–7)
  { id: "07-kkeut", month: 7, type: "kkeut", name: "Boar",        nameKo: "멧돼지", image: "/cards/cell-r0-c4.png" },
  { id: "07-tti",   month: 7, type: "tti",   name: "Grass ribbon", nameKo: "초단", tag: "초단", tagKo: "초단", image: "/cards/cell-r0-c5.png" },
  { id: "07-pi-1",  month: 7, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r0-c6.png" },
  { id: "07-pi-2",  month: 7, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r0-c7.png" },

  // 8월 — 공산명월 (row 1, cols 4–7)
  { id: "08-gwang", month: 8, type: "gwang", name: "Moon bright", nameKo: "공산광 (달)", image: "/cards/cell-r1-c4.png" },
  { id: "08-kkeut", month: 8, type: "kkeut", name: "Geese",       nameKo: "기러기", image: "/cards/cell-r1-c5.png" },
  { id: "08-pi-1",  month: 8, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r1-c6.png" },
  { id: "08-pi-2",  month: 8, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r1-c7.png" },

  // 9월 — 국화 (row 2, cols 4–7)
  { id: "09-kkeut", month: 9, type: "kkeut", name: "Sake cup",    nameKo: "국준 (술잔)", image: "/cards/cell-r2-c4.png" },
  { id: "09-tti",   month: 9, type: "tti",   name: "Blue ribbon", nameKo: "청단", tag: "청단", tagKo: "청단", image: "/cards/cell-r2-c5.png" },
  { id: "09-pi-1",  month: 9, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r2-c6.png" },
  { id: "09-pi-2",  month: 9, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r2-c7.png" },

  // 10월 — 단풍 (row 3, cols 4–7)
  { id: "10-kkeut", month: 10, type: "kkeut", name: "Deer",       nameKo: "사슴", image: "/cards/cell-r3-c4.png" },
  { id: "10-tti",   month: 10, type: "tti",   name: "Blue ribbon", nameKo: "청단", tag: "청단", tagKo: "청단", image: "/cards/cell-r3-c5.png" },
  { id: "10-pi-1",  month: 10, type: "pi",    name: "Pip",        nameKo: "피", image: "/cards/cell-r3-c6.png" },
  { id: "10-pi-2",  month: 10, type: "pi",    name: "Pip",        nameKo: "피", image: "/cards/cell-r3-c7.png" },

  // 11월 — 오동 (row 4, cols 4–7)
  { id: "11-gwang", month: 11, type: "gwang", name: "Paulownia bright", nameKo: "오동광 (똥광)", image: "/cards/cell-r4-c4.png" },
  { id: "11-pi-1",  month: 11, type: "pi",    name: "Pip",        nameKo: "피", image: "/cards/cell-r4-c5.png" },
  { id: "11-pi-2",  month: 11, type: "pi",    name: "Pip",        nameKo: "피", image: "/cards/cell-r4-c6.png" },
  { id: "11-pi-3",  month: 11, type: "pi",    name: "Double pip", nameKo: "쌍피", tag: "쌍피", tagKo: "쌍피", image: "/cards/cell-r4-c7.png" },

  // 12월 — 비 (row 5, cols 4–7)
  { id: "12-gwang", month: 12, type: "gwang", name: "Rain bright (Ono no Michikaze)", nameKo: "비광", tag: "비광", tagKo: "비광", image: "/cards/cell-r5-c4.png" },
  { id: "12-tti",   month: 12, type: "tti",   name: "Red ribbon", nameKo: "홍단", tag: "홍단", tagKo: "홍단", image: "/cards/cell-r5-c5.png" },
  { id: "12-kkeut", month: 12, type: "kkeut", name: "Swallow",    nameKo: "제비", image: "/cards/cell-r5-c6.png" },
  { id: "12-pi",    month: 12, type: "pi",    name: "Double pip", nameKo: "쌍피", tag: "쌍피", tagKo: "쌍피", image: "/cards/cell-r5-c7.png" },
];
