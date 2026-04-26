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
  /** Cultural / historical context. Populated for the 5 brights and 9 animals. */
  lore?: string;
  loreKo?: string;
};

export type Month = {
  num: number;
  motif: string;
  motifKo: string;
};

// English motifs use the BOTANICALLY accurate name; Korean names use the
// common nickname. 4월 (등나무 / Wisteria) is colloquially called 흑싸리,
// and 5월 (제비붓꽃 / Iris) is colloquially called 난초 — both Korean
// names persist as game shorthand even though they don't match the plant.
export const MONTHS: ReadonlyArray<Month> = [
  { num: 1,  motif: "Pine & crane",       motifKo: "송학" },
  { num: 2,  motif: "Plum & warbler",     motifKo: "매조" },
  { num: 3,  motif: "Cherry blossom",     motifKo: "벚꽃" },
  { num: 4,  motif: "Wisteria",           motifKo: "흑싸리" },
  { num: 5,  motif: "Iris",               motifKo: "난초" },
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
 * Card PNGs live in `/public/cards/cell-r{row}-c{col}.png` on an 8×6 grid.
 * Within each row, cols 0–3 are the month listed first, cols 4–7 are that
 * month + 6. Within each month's four slots the order is highest-tier first
 * (광 if it exists, else 끗), then 띠, then pi/쌍피.
 */
export const HWATU_DECK: ReadonlyArray<HwatuCard> = [
  // 1월 — 송학 (row 0, cols 0–3)
  { id: "01-gwang", month: 1, type: "gwang", name: "Pine bright", nameKo: "송학광", image: "/cards/cell-r0-c0.png",
    lore: "A red-crowned crane stands among pines under a rising sun. In East Asian art, pine and crane together symbolize longevity and dignity — fitting for the year's first card.",
    loreKo: "송학(松鶴) — 소나무에 앉은 학과 떠오르는 해. 동아시아 회화에서 송학은 장수와 기품을 상징해요. 한 해의 첫 번째 광답죠." },
  { id: "01-tti",   month: 1, type: "tti",   name: "Red ribbon",  nameKo: "홍단", tag: "홍단", tagKo: "홍단", image: "/cards/cell-r0-c1.png" },
  { id: "01-pi-1",  month: 1, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r0-c2.png" },
  { id: "01-pi-2",  month: 1, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r0-c3.png" },

  // 2월 — 매조 (row 1, cols 0–3)
  { id: "02-kkeut", month: 2, type: "kkeut", name: "Warbler",     nameKo: "매조 (휘파람새)", image: "/cards/cell-r1-c0.png",
    lore: "A bush warbler perches on a plum branch — the first songbird of spring, paired with the first blossom.",
    loreKo: "매화 가지에 앉은 휘파람새. 봄을 알리는 첫 새이자 첫 꽃의 짝이에요." },
  { id: "02-tti",   month: 2, type: "tti",   name: "Red ribbon",  nameKo: "홍단", tag: "홍단", tagKo: "홍단", image: "/cards/cell-r1-c1.png" },
  { id: "02-pi-1",  month: 2, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r1-c2.png" },
  { id: "02-pi-2",  month: 2, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r1-c3.png" },

  // 3월 — 벚꽃 (row 2, cols 0–3)
  { id: "03-gwang", month: 3, type: "gwang", name: "Cherry bright", nameKo: "벚꽃광", image: "/cards/cell-r2-c0.png",
    lore: "Cherry blossoms under a striped curtain (만막) — the iconic spring picnic scene celebrating brief, brilliant beauty.",
    loreKo: "만막(慢幕) 아래 흩날리는 벚꽃. 화려하지만 짧은 봄의 아름다움을 그린 가장 상징적인 광." },
  { id: "03-tti",   month: 3, type: "tti",   name: "Red poetry ribbon", nameKo: "홍단", tag: "홍단", tagKo: "홍단", image: "/cards/cell-r2-c1.png" },
  { id: "03-pi-1",  month: 3, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r2-c2.png" },
  { id: "03-pi-2",  month: 3, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r2-c3.png" },

  // 4월 — 흑싸리 (row 3, cols 0–3)
  { id: "04-kkeut", month: 4, type: "kkeut", name: "Cuckoo",      nameKo: "두견새", image: "/cards/cell-r3-c0.png",
    lore: "A cuckoo crosses the moon over black bush clover — a classical motif of solitude and nostalgia.",
    loreKo: "흑싸리 위로 달을 가르는 두견새. 고독과 그리움을 상징하는 옛 그림 그대로예요." },
  { id: "04-tti",   month: 4, type: "tti",   name: "Grass ribbon", nameKo: "초단", tag: "초단", tagKo: "초단", image: "/cards/cell-r3-c1.png" },
  { id: "04-pi-1",  month: 4, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r3-c2.png" },
  { id: "04-pi-2",  month: 4, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r3-c3.png" },

  // 5월 — 난초 (row 4, cols 0–3)
  { id: "05-kkeut", month: 5, type: "kkeut", name: "Bridge",      nameKo: "다리", image: "/cards/cell-r4-c0.png",
    lore: "A small wooden bridge over irises — actually a misnamed image, since the original Japanese motif is irises by water without a bridge.",
    loreKo: "붓꽃(난초) 사이로 놓인 다리. 원래 일본 하나후다에는 다리 없이 물가 붓꽃만 있었는데, 한국 화투에서 다리가 강조되며 굳어졌어요." },
  { id: "05-tti",   month: 5, type: "tti",   name: "Grass ribbon", nameKo: "초단", tag: "초단", tagKo: "초단", image: "/cards/cell-r4-c1.png" },
  { id: "05-pi-1",  month: 5, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r4-c2.png" },
  { id: "05-pi-2",  month: 5, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r4-c3.png" },

  // 6월 — 모란 (row 5, cols 0–3)
  { id: "06-kkeut", month: 6, type: "kkeut", name: "Butterfly",   nameKo: "나비", image: "/cards/cell-r5-c0.png",
    lore: "Butterflies dancing on peonies — the peony is called 부귀화 (flower of wealth), and the butterflies bring elegance and love.",
    loreKo: "모란꽃에 앉은 나비. 모란은 '부귀화'라 불리는 부의 꽃이고, 나비는 우아함과 사랑의 상징이에요." },
  { id: "06-tti",   month: 6, type: "tti",   name: "Blue ribbon", nameKo: "청단", tag: "청단", tagKo: "청단", image: "/cards/cell-r5-c1.png" },
  { id: "06-pi-1",  month: 6, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r5-c2.png" },
  { id: "06-pi-2",  month: 6, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r5-c3.png" },

  // 7월 — 홍싸리 (row 0, cols 4–7)
  { id: "07-kkeut", month: 7, type: "kkeut", name: "Boar",        nameKo: "멧돼지", image: "/cards/cell-r0-c4.png",
    lore: "A wild boar charging through red bush clover. Boars symbolize courage and stubborn drive — the spirit of midsummer.",
    loreKo: "홍싸리를 헤치고 달리는 멧돼지. 한여름의 힘찬 기세 — 용기와 고집을 상징해요." },
  { id: "07-tti",   month: 7, type: "tti",   name: "Grass ribbon", nameKo: "초단", tag: "초단", tagKo: "초단", image: "/cards/cell-r0-c5.png" },
  { id: "07-pi-1",  month: 7, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r0-c6.png" },
  { id: "07-pi-2",  month: 7, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r0-c7.png" },

  // 8월 — 공산명월 (row 1, cols 4–7)
  { id: "08-gwang", month: 8, type: "gwang", name: "Moon bright", nameKo: "공산광 (달)", image: "/cards/cell-r1-c4.png",
    lore: "The full moon rising over a dark mountain. The autumn moon is the most poetic moon in East Asian art — perfectly round, melancholic, complete.",
    loreKo: "공산명월(空山明月) — 빈 산 위로 떠오른 보름달. 동아시아 회화에서 가장 시적인 달은 가을달이에요. 완벽하게 둥글고, 적막하고, 가득해요." },
  { id: "08-kkeut", month: 8, type: "kkeut", name: "Geese",       nameKo: "기러기", image: "/cards/cell-r1-c5.png",
    lore: "Three geese flying south — the autumn migration, a classical sign of the season changing.",
    loreKo: "남쪽으로 날아가는 기러기 세 마리. 가을의 본격적인 시작을 알리는 고전적 풍경이에요." },
  { id: "08-pi-1",  month: 8, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r1-c6.png" },
  { id: "08-pi-2",  month: 8, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r1-c7.png" },

  // 9월 — 국화 (row 2, cols 4–7)
  { id: "09-kkeut", month: 9, type: "kkeut", name: "Sake cup",    nameKo: "국준 (술잔)", image: "/cards/cell-r2-c4.png",
    lore: "A sake cup beside chrysanthemums. In some matgo rules this card doubles as a 쌍피 — a hidden bonus that surprises new players.",
    loreKo: "국화 옆 술잔. 맞고 룰에서는 이 카드를 쌍피로도 쓸 수 있어요 — 처음 치는 사람이 깜짝 놀라는 숨겨진 룰이에요." },
  { id: "09-tti",   month: 9, type: "tti",   name: "Blue ribbon", nameKo: "청단", tag: "청단", tagKo: "청단", image: "/cards/cell-r2-c5.png" },
  { id: "09-pi-1",  month: 9, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r2-c6.png" },
  { id: "09-pi-2",  month: 9, type: "pi",    name: "Pip",         nameKo: "피", image: "/cards/cell-r2-c7.png" },

  // 10월 — 단풍 (row 3, cols 4–7)
  { id: "10-kkeut", month: 10, type: "kkeut", name: "Deer",       nameKo: "사슴", image: "/cards/cell-r3-c4.png",
    lore: "A stag among red maple leaves. Together with 멧돼지 (boar) and 나비 (butterfly), this forms 고도리 — wait no, that's the bird trio. Deer pairs with autumn instead.",
    loreKo: "단풍 사이의 사슴. 가을의 가장 상징적인 동물." },
  { id: "10-tti",   month: 10, type: "tti",   name: "Blue ribbon", nameKo: "청단", tag: "청단", tagKo: "청단", image: "/cards/cell-r3-c5.png" },
  { id: "10-pi-1",  month: 10, type: "pi",    name: "Pip",        nameKo: "피", image: "/cards/cell-r3-c6.png" },
  { id: "10-pi-2",  month: 10, type: "pi",    name: "Pip",        nameKo: "피", image: "/cards/cell-r3-c7.png" },

  // 11월 — 오동 (row 4, cols 4–7)
  { id: "11-gwang", month: 11, type: "gwang", name: "Paulownia bright", nameKo: "오동광 (똥광)", image: "/cards/cell-r4-c4.png",
    lore: "A phoenix perched on a paulownia tree. The phoenix supposedly only lands on paulownia, making it the imperial bird. Affectionately nicknamed 똥광 (poo-bright) for its earthy color.",
    loreKo: "오동나무에 앉은 봉황. 봉황은 오직 오동나무에만 앉는다 해서 황제의 새. 색이 거뭇해 친근하게 '똥광'이라고도 불려요." },
  { id: "11-pi-1",  month: 11, type: "pi",    name: "Pip",        nameKo: "피", image: "/cards/cell-r4-c5.png" },
  { id: "11-pi-2",  month: 11, type: "pi",    name: "Pip",        nameKo: "피", image: "/cards/cell-r4-c6.png" },
  { id: "11-pi-3",  month: 11, type: "pi",    name: "Double pip", nameKo: "쌍피", tag: "쌍피", tagKo: "쌍피", image: "/cards/cell-r4-c7.png" },

  // 12월 — 비 (row 5, cols 4–7)
  { id: "12-gwang", month: 12, type: "gwang", name: "Rain bright (Ono no Michikaze)", nameKo: "비광", tag: "비광", tagKo: "비광", image: "/cards/cell-r5-c4.png",
    lore: "Ono no Michikaze, a Heian-era calligrapher, sheltering under an umbrella. Watching a frog repeatedly leap at a willow branch taught him persistence — the moral of the picture.",
    loreKo: "헤이안 시대 서예가 오노노 미치카제(小野道風)가 우산을 쓴 모습. 버드나무에 자꾸 뛰어오르는 개구리를 보고 끈기를 배웠다는 일화가 그림에 담겼어요." },
  // 12월 띠 — 표준 고스톱 룰에선 어떤 단(홍/청/초) 콤보에도 속하지 않음.
  // (일부 변형 룰에서 초단으로 분류) → tag 미부여로 콤보 카운트에서 제외.
  { id: "12-tti",   month: 12, type: "tti",   name: "Plain ribbon", nameKo: "12월 띠", image: "/cards/cell-r5-c5.png" },
  { id: "12-kkeut", month: 12, type: "kkeut", name: "Swallow",    nameKo: "제비", image: "/cards/cell-r5-c6.png",
    lore: "A swallow against rain — the rain card's animal, traveling through storms. Often a bonus card in 고도리 sets.",
    loreKo: "빗속을 가르는 제비 — 비 카드의 동물. 고도리 짝의 일부로 점수가 되는 카드예요." },
  { id: "12-pi",    month: 12, type: "pi",    name: "Double pip", nameKo: "쌍피", tag: "쌍피", tagKo: "쌍피", image: "/cards/cell-r5-c7.png" },
];
