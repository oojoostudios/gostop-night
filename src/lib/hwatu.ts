import { SCORING } from '@/config/rules';

export type HwatuType = 'gwang' | 'tti' | 'kkeut' | 'pi';

export type HwatuCard = {
  id: string;
  month: number;
  type: HwatuType;
  /** Card name in English, exactly as in CLAUDE.md's card table (e.g. "Pine Red Ribbon"). */
  name: string;
  /** Card name in Korean (e.g. "송학 홍단"). */
  nameKo: string;
  /**
   * Marks the two double-junk cards ("쌍피"). The scoring code counts these as
   * 2 junk, so keep it on exactly those cards.
   */
  tag?: string;
  tagKo?: string;
  /**
   * Overrides the type label for this one card, for cards whose value doesn't
   * match their type's generic label (September's sake cup, which can be played
   * as an animal OR two junk; the double-junk cards, worth 2 junk each). Falls
   * back to `HWATU_TYPES[type].label` when unset.
   */
  typeLabel?: string;
  typeLabelKo?: string;
  /** Combo this card belongs to. Bilingual as written unless `comboKo` is set. Unset = none. */
  combo?: string;
  comboKo?: string;
  /** Path to the card image (WebP made from assets-source/cards). */
  image: string;
  /** Cultural / historical context. Populated for the 5 brights and 9 animals. */
  lore?: string;
  loreKo?: string;
};

export type Month = {
  num: number;
  /** Short English month name, e.g. "Mar". */
  abbr: string;
  /** Flower / motif in English, e.g. "Pampas Grass". */
  motif: string;
  /** Month name in Korean, e.g. "공산". */
  motifKo: string;
};

// Month names come from the "Month KO" column in CLAUDE.md's card table.
export const MONTHS: ReadonlyArray<Month> = [
  { num: 1, abbr: 'Jan', motif: 'Pine', motifKo: '송학' },
  { num: 2, abbr: 'Feb', motif: 'Plum Blossom', motifKo: '매조' },
  { num: 3, abbr: 'Mar', motif: 'Cherry Blossom', motifKo: '벚꽃' },
  { num: 4, abbr: 'Apr', motif: 'Wisteria', motifKo: '흑싸리' },
  { num: 5, abbr: 'May', motif: 'Iris', motifKo: '난초' },
  { num: 6, abbr: 'Jun', motif: 'Peony', motifKo: '모란' },
  { num: 7, abbr: 'Jul', motif: 'Bush Clover', motifKo: '홍싸리' },
  { num: 8, abbr: 'Aug', motif: 'Pampas Grass', motifKo: '공산' },
  { num: 9, abbr: 'Sep', motif: 'Chrysanthemum', motifKo: '국진' },
  { num: 10, abbr: 'Oct', motif: 'Maple', motifKo: '단풍' },
  { num: 11, abbr: 'Nov', motif: 'Paulownia', motifKo: '오동' },
  { num: 12, abbr: 'Dec', motif: 'Rain Willow', motifKo: '비' },
];

/** 3 -> "three", 5 -> "five", 10 -> "ten" (other numbers stay as digits). */
const word = (n: number) => ({ 3: 'three', 5: 'five', 10: 'ten' })[n] ?? String(n);

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

// Terms table (CLAUDE.md): hanja, Korean, romanized, English label.
export const HWATU_TYPES: Record<
  HwatuType,
  {
    label: string;
    labelKo: string;
    hanja: string;
    roman: string;
    blurb: string;
    blurbKo: string;
  }
> = {
  gwang: {
    label: 'Bright',
    labelKo: '광',
    hanja: '光',
    roman: 'Gwang',
    blurb: `The five most prestigious cards. Collect ${word(SCORING.brights.three)} or more to score.`,
    blurbKo: `다섯 장의 가장 귀한 카드. ${SCORING.brights.three}장 이상 모으면 점수가 됩니다.`,
  },
  tti: {
    label: 'Ribbon',
    labelKo: '띠',
    hanja: '紅',
    roman: 'Tti',
    blurb: 'Cards with red, blue, or grass-colored ribbons. Sets of three score extra.',
    blurbKo: '빨강·파랑·초록 띠가 있는 카드. 세 장 한 세트로 점수가 됩니다.',
  },
  kkeut: {
    label: 'Animal',
    labelKo: '열',
    hanja: '動',
    roman: 'Yeol',
    blurb: `Cards depicting animals. ${cap(word(SCORING.animalsStartAt))} of these score one point.`,
    blurbKo: `동물이 그려진 카드. ${SCORING.animalsStartAt}장부터 1점.`,
  },
  pi: {
    label: 'Junk',
    labelKo: '피',
    hanja: '皮',
    roman: 'Pi',
    blurb: `Plain cards. ${cap(word(SCORING.junkStartAt))} score one point; doubles (쌍피) count as two.`,
    blurbKo: `일반 카드. ${SCORING.junkStartAt}장에 1점, 쌍피는 두 장으로 셉니다.`,
  },
};

// Combos. Written once here so every card in a combo says the same thing.
const BRIGHTS = { combo: 'Brights', comboKo: '삼광 · 사광 · 오광' };
const RED = { combo: '홍단 Red' };
const GRASS = { combo: '초단 Grass' };
const BLUE = { combo: '청단 Blue' };
const GODORI = { combo: 'Godori 고도리' };
const NO_COMBO = { combo: 'No combo · 조합 없음' };
const RAIN_BRIGHT = {
  combo: `Brights (Rain: ${SCORING.brights.three} Brights = ${SCORING.brights.threeWithRain} pts)`,
  comboKo: `삼광 · 사광 · 오광 (비광 포함 삼광 = ${SCORING.brights.threeWithRain}점)`,
};

/** Short English name for a type label, then Korean. Used by the caption. */
export function cardTypeLabels(card: HwatuCard): { en: string; ko: string } {
  const meta = HWATU_TYPES[card.type];
  return { en: card.typeLabel ?? meta.label, ko: card.typeLabelKo ?? meta.labelKo };
}

/**
 * The 3-line card caption used everywhere a card image appears (CLAUDE.md):
 *   3월 · Mar
 *   Cherry Blossom Red Ribbon
 *   벚꽃 홍단 · Ribbon 띠
 * In Korean, lines 2 and 3 swap places.
 */
export function cardCaption(
  card: HwatuCard,
  locale: 'en' | 'ko' = 'en',
): { line1: string; line2: string; line3: string } {
  const month = MONTHS[card.month - 1];
  const type = cardTypeLabels(card);
  const english = card.name;
  const korean = `${card.nameKo} · ${type.en} ${type.ko}`;
  return {
    line1: `${card.month}월 · ${month.abbr}`,
    line2: locale === 'ko' ? korean : english,
    line3: locale === 'ko' ? english : korean,
  };
}

/**
 * The caption as one line, for image alt text, hover titles and screen readers
 * on cards too small to show the full caption. Locale-independent: both
 * languages are always included.
 */
export function cardLabel(card: HwatuCard): string {
  const { line1, line2, line3 } = cardCaption(card);
  return `${line1} · ${line2} · ${line3}`;
}

/** Combo text for the card in the given language, or undefined if it has none. */
export function cardCombo(card: HwatuCard, locale: 'en' | 'ko' = 'en'): string | undefined {
  return locale === 'ko' ? (card.comboKo ?? card.combo) : card.combo;
}

/** Double junk (쌍피): the fifth term in the Terms table. It has no hanja. */
export const DOUBLE_JUNK = {
  label: 'Double junk ×2',
  labelKo: '쌍피 ×2',
  termKo: '쌍피',
  roman: 'Ssangpi',
} as const;

/** True for the two double-junk cards (Nov and Dec). The scoring code relies on the same tag. */
export const isDoubleJunk = (card: HwatuCard): boolean => card.tag === '쌍피';

/** Columns of the month-by-type grid in Section 01. Double junk gets its own column. */
export type DeckColumn = HwatuType | 'double';
export const DECK_COLUMNS: ReadonlyArray<DeckColumn> = ['gwang', 'kkeut', 'tti', 'pi', 'double'];
export const deckColumn = (card: HwatuCard): DeckColumn =>
  isDoubleJunk(card) ? 'double' : card.type;

/** The months (in order) in which at least one card matches. */
export function monthsWhere(match: (card: HwatuCard) => boolean): ReadonlyArray<Month> {
  return MONTHS.filter((m) => HWATU_DECK.some((c) => c.month === m.num && match(c)));
}

/** Months in which a column of the grid has a card. Junk means regular junk; double junk is its own column. */
export const monthsForColumn = (column: DeckColumn): ReadonlyArray<Month> =>
  monthsWhere((c) => deckColumn(c) === column);

/** A month group header, e.g. `08 · 공산 · PAMPAS GRASS`. */
export const monthHeader = (month: Month): string =>
  `${String(month.num).padStart(2, '0')} · ${month.motifKo} · ${month.motif.toUpperCase()}`;

/** A row label for Section 01's month-by-type grid, e.g. `01 · Jan · 송학 · Pine`. */
export const monthRowLabel = (month: Month): string =>
  `${String(month.num).padStart(2, '0')} · ${month.abbr} · ${month.motifKo} · ${month.motif}`;

/** Months as a list for the given language: "Jan · Mar · Aug" or "1월 · 3월 · 8월". */
export const monthList = (months: ReadonlyArray<Month>, locale: 'en' | 'ko'): string =>
  months.map((m) => (locale === 'ko' ? `${m.num}월` : m.abbr)).join(' · ');

/**
 * Standard 48-card hwatu deck. 5 광, 10 띠, 9 열, 24 피.
 *
 * Every name, type and combo below matches the "Card data — FINAL" table in
 * CLAUDE.md. Card WebPs live in `/public/cards/m{month}-{type}[-n].webp`
 * (original art). Within each month's slots the order is highest-tier first
 * (광 if it exists, else 열), then 띠, then 피/쌍피.
 */
export const HWATU_DECK: ReadonlyArray<HwatuCard> = [
  // 1월 — 송학
  {
    id: '01-gwang',
    month: 1,
    type: 'gwang',
    name: 'Pine Bright',
    nameKo: '송학 광',
    ...BRIGHTS,
    image: '/cards/m01-bright.webp',
    lore: "A red-crowned crane stands among pines under a rising sun. In East Asian art, pine and crane together symbolize longevity and dignity — fitting for the year's first card.",
    loreKo:
      '송학(松鶴) — 소나무에 앉은 학과 떠오르는 해. 동아시아 회화에서 송학은 장수와 기품을 상징해요. 한 해의 첫 번째 광답죠.',
  },
  {
    id: '01-tti',
    month: 1,
    type: 'tti',
    name: 'Pine Red Ribbon',
    nameKo: '송학 홍단',
    ...RED,
    image: '/cards/m01-ribbon.webp',
  },
  {
    id: '01-pi-1',
    month: 1,
    type: 'pi',
    name: 'Pine Junk',
    nameKo: '송학 피',
    image: '/cards/m01-junk-1.webp',
  },
  {
    id: '01-pi-2',
    month: 1,
    type: 'pi',
    name: 'Pine Junk',
    nameKo: '송학 피',
    image: '/cards/m01-junk-2.webp',
  },

  // 2월 — 매조
  {
    id: '02-kkeut',
    month: 2,
    type: 'kkeut',
    name: 'Plum Blossom + Warbler',
    nameKo: '매조 꾀꼬리',
    ...GODORI,
    image: '/cards/m02-animal.webp',
    lore: 'A bush warbler perches on a plum branch — the first songbird of spring, paired with the first blossom.',
    loreKo: '매화 가지에 앉은 휘파람새. 봄을 알리는 첫 새이자 첫 꽃의 짝이에요.',
  },
  {
    id: '02-tti',
    month: 2,
    type: 'tti',
    name: 'Plum Blossom Red Ribbon',
    nameKo: '매조 홍단',
    ...RED,
    image: '/cards/m02-ribbon.webp',
  },
  {
    id: '02-pi-1',
    month: 2,
    type: 'pi',
    name: 'Plum Blossom Junk',
    nameKo: '매조 피',
    image: '/cards/m02-junk-1.webp',
  },
  {
    id: '02-pi-2',
    month: 2,
    type: 'pi',
    name: 'Plum Blossom Junk',
    nameKo: '매조 피',
    image: '/cards/m02-junk-2.webp',
  },

  // 3월 — 벚꽃
  {
    id: '03-gwang',
    month: 3,
    type: 'gwang',
    name: 'Cherry Blossom Bright',
    nameKo: '벚꽃 광',
    ...BRIGHTS,
    image: '/cards/m03-bright.webp',
    lore: 'Cherry blossoms under a striped curtain (만막) — the iconic spring picnic scene celebrating brief, brilliant beauty.',
    loreKo: '만막(慢幕) 아래 흩날리는 벚꽃. 화려하지만 짧은 봄의 아름다움을 그린 가장 상징적인 광.',
  },
  {
    id: '03-tti',
    month: 3,
    type: 'tti',
    name: 'Cherry Blossom Red Ribbon',
    nameKo: '벚꽃 홍단',
    ...RED,
    image: '/cards/m03-ribbon.webp',
  },
  {
    id: '03-pi-1',
    month: 3,
    type: 'pi',
    name: 'Cherry Blossom Junk',
    nameKo: '벚꽃 피',
    image: '/cards/m03-junk-1.webp',
  },
  {
    id: '03-pi-2',
    month: 3,
    type: 'pi',
    name: 'Cherry Blossom Junk',
    nameKo: '벚꽃 피',
    image: '/cards/m03-junk-2.webp',
  },

  // 4월 — 흑싸리
  {
    id: '04-kkeut',
    month: 4,
    type: 'kkeut',
    name: 'Wisteria + Cuckoo',
    nameKo: '흑싸리 두견새',
    ...GODORI,
    image: '/cards/m04-animal.webp',
    lore: 'A cuckoo crosses the moon over wisteria — a classical motif of solitude and nostalgia. The Korean name 흑싸리 literally means "black bush clover", but the flower is wisteria.',
    loreKo:
      '등나무 위로 달을 가르는 두견새. 고독과 그리움을 상징하는 옛 그림 그대로예요. 흑싸리는 글자 그대로 "검은 싸리"라는 뜻이지만, 그려진 꽃은 등나무예요.',
  },
  {
    id: '04-tti',
    month: 4,
    type: 'tti',
    name: 'Wisteria Grass Ribbon',
    nameKo: '흑싸리 초단',
    ...GRASS,
    image: '/cards/m04-ribbon.webp',
  },
  {
    id: '04-pi-1',
    month: 4,
    type: 'pi',
    name: 'Wisteria Junk',
    nameKo: '흑싸리 피',
    image: '/cards/m04-junk-1.webp',
  },
  {
    id: '04-pi-2',
    month: 4,
    type: 'pi',
    name: 'Wisteria Junk',
    nameKo: '흑싸리 피',
    image: '/cards/m04-junk-2.webp',
  },

  // 5월 — 난초
  {
    id: '05-kkeut',
    month: 5,
    type: 'kkeut',
    name: 'Iris + Bridge',
    nameKo: '난초 다리',
    image: '/cards/m05-animal.webp',
    lore: 'A small wooden bridge over irises — actually a misnamed image, since the original Japanese motif is irises by water without a bridge.',
    loreKo:
      '붓꽃(난초) 사이로 놓인 다리. 원래 일본 하나후다에는 다리 없이 물가 붓꽃만 있었는데, 한국 화투에서 다리가 강조되며 굳어졌어요.',
  },
  {
    id: '05-tti',
    month: 5,
    type: 'tti',
    name: 'Iris Grass Ribbon',
    nameKo: '난초 초단',
    ...GRASS,
    image: '/cards/m05-ribbon.webp',
  },
  {
    id: '05-pi-1',
    month: 5,
    type: 'pi',
    name: 'Iris Junk',
    nameKo: '난초 피',
    image: '/cards/m05-junk-1.webp',
  },
  {
    id: '05-pi-2',
    month: 5,
    type: 'pi',
    name: 'Iris Junk',
    nameKo: '난초 피',
    image: '/cards/m05-junk-2.webp',
  },

  // 6월 — 모란
  {
    id: '06-kkeut',
    month: 6,
    type: 'kkeut',
    name: 'Peony + Butterflies',
    nameKo: '모란 나비',
    image: '/cards/m06-animal.webp',
    lore: 'Butterflies dancing on peonies — the peony is called 부귀화 (flower of wealth), and the butterflies bring elegance and love.',
    loreKo:
      "모란꽃에 앉은 나비. 모란은 '부귀화'라 불리는 부의 꽃이고, 나비는 우아함과 사랑의 상징이에요.",
  },
  {
    id: '06-tti',
    month: 6,
    type: 'tti',
    name: 'Peony Blue Ribbon',
    nameKo: '모란 청단',
    ...BLUE,
    image: '/cards/m06-ribbon.webp',
  },
  {
    id: '06-pi-1',
    month: 6,
    type: 'pi',
    name: 'Peony Junk',
    nameKo: '모란 피',
    image: '/cards/m06-junk-1.webp',
  },
  {
    id: '06-pi-2',
    month: 6,
    type: 'pi',
    name: 'Peony Junk',
    nameKo: '모란 피',
    image: '/cards/m06-junk-2.webp',
  },

  // 7월 — 홍싸리
  {
    id: '07-kkeut',
    month: 7,
    type: 'kkeut',
    name: 'Bush Clover + Boar',
    nameKo: '홍싸리 멧돼지',
    image: '/cards/m07-animal.webp',
    lore: 'A wild boar charging through red bush clover. Boars symbolize courage and stubborn drive — the spirit of midsummer.',
    loreKo: '홍싸리를 헤치고 달리는 멧돼지. 한여름의 힘찬 기세 — 용기와 고집을 상징해요.',
  },
  {
    id: '07-tti',
    month: 7,
    type: 'tti',
    name: 'Bush Clover Grass Ribbon',
    nameKo: '홍싸리 초단',
    ...GRASS,
    image: '/cards/m07-ribbon.webp',
  },
  {
    id: '07-pi-1',
    month: 7,
    type: 'pi',
    name: 'Bush Clover Junk',
    nameKo: '홍싸리 피',
    image: '/cards/m07-junk-1.webp',
  },
  {
    id: '07-pi-2',
    month: 7,
    type: 'pi',
    name: 'Bush Clover Junk',
    nameKo: '홍싸리 피',
    image: '/cards/m07-junk-2.webp',
  },

  // 8월 — 공산
  {
    id: '08-gwang',
    month: 8,
    type: 'gwang',
    name: 'Pampas Grass Bright',
    nameKo: '공산 광',
    ...BRIGHTS,
    image: '/cards/m08-bright.webp',
    lore: 'The full moon rising over a dark mountain. The autumn moon is the most poetic moon in East Asian art — perfectly round, melancholic, complete.',
    loreKo:
      '공산명월(空山明月) — 빈 산 위로 떠오른 보름달. 동아시아 회화에서 가장 시적인 달은 가을달이에요. 완벽하게 둥글고, 적막하고, 가득해요.',
  },
  {
    id: '08-kkeut',
    month: 8,
    type: 'kkeut',
    name: 'Pampas Grass + Geese',
    nameKo: '공산 기러기',
    ...GODORI,
    image: '/cards/m08-animal.webp',
    lore: 'Three geese flying south — the autumn migration, a classical sign of the season changing.',
    loreKo: '남쪽으로 날아가는 기러기 세 마리. 가을의 본격적인 시작을 알리는 고전적 풍경이에요.',
  },
  {
    id: '08-pi-1',
    month: 8,
    type: 'pi',
    name: 'Pampas Grass Junk',
    nameKo: '공산 피',
    image: '/cards/m08-junk-1.webp',
  },
  {
    id: '08-pi-2',
    month: 8,
    type: 'pi',
    name: 'Pampas Grass Junk',
    nameKo: '공산 피',
    image: '/cards/m08-junk-2.webp',
  },

  // 9월 — 국진
  {
    id: '09-kkeut',
    month: 9,
    type: 'kkeut',
    name: 'Chrysanthemum + Sake Cup',
    nameKo: '국진 술잔',
    typeLabel: 'Animal or Double junk',
    typeLabelKo: '열 또는 쌍피',
    image: '/cards/m09-animal.webp',
    lore: 'A sake cup beside chrysanthemums. It counts as an Animal or as two junk (쌍피) — the player picks when scoring.',
    loreKo: '국화 옆 술잔. 열로도, 쌍피(피 2장)로도 셀 수 있고, 점수 셈할 때 플레이어가 골라요.',
  },
  {
    id: '09-tti',
    month: 9,
    type: 'tti',
    name: 'Chrysanthemum Blue Ribbon',
    nameKo: '국진 청단',
    ...BLUE,
    image: '/cards/m09-ribbon.webp',
  },
  {
    id: '09-pi-1',
    month: 9,
    type: 'pi',
    name: 'Chrysanthemum Junk',
    nameKo: '국진 피',
    image: '/cards/m09-junk-1.webp',
  },
  {
    id: '09-pi-2',
    month: 9,
    type: 'pi',
    name: 'Chrysanthemum Junk',
    nameKo: '국진 피',
    image: '/cards/m09-junk-2.webp',
  },

  // 10월 — 단풍
  {
    id: '10-kkeut',
    month: 10,
    type: 'kkeut',
    name: 'Maple + Deer',
    nameKo: '단풍 사슴',
    image: '/cards/m10-animal.webp',
    lore: 'A stag among red maple leaves — the most iconic animal of autumn.',
    loreKo: '단풍 사이의 사슴. 가을의 가장 상징적인 동물.',
  },
  {
    id: '10-tti',
    month: 10,
    type: 'tti',
    name: 'Maple Blue Ribbon',
    nameKo: '단풍 청단',
    ...BLUE,
    image: '/cards/m10-ribbon.webp',
  },
  {
    id: '10-pi-1',
    month: 10,
    type: 'pi',
    name: 'Maple Junk',
    nameKo: '단풍 피',
    image: '/cards/m10-junk-1.webp',
  },
  {
    id: '10-pi-2',
    month: 10,
    type: 'pi',
    name: 'Maple Junk',
    nameKo: '단풍 피',
    image: '/cards/m10-junk-2.webp',
  },

  // 11월 — 오동
  {
    id: '11-gwang',
    month: 11,
    type: 'gwang',
    name: 'Paulownia Bright',
    nameKo: '오동 광',
    ...BRIGHTS,
    image: '/cards/m11-bright.webp',
    lore: 'A phoenix perched on a paulownia tree. The phoenix supposedly only lands on paulownia, making it the imperial bird. Affectionately nicknamed 똥광 (poo-bright) for its earthy color.',
    loreKo:
      "오동나무에 앉은 봉황. 봉황은 오직 오동나무에만 앉는다 해서 황제의 새. 색이 거뭇해 친근하게 '똥광'이라고도 불려요.",
  },
  {
    id: '11-pi-1',
    month: 11,
    type: 'pi',
    name: 'Paulownia Junk',
    nameKo: '오동 피',
    image: '/cards/m11-junk-1.webp',
  },
  {
    id: '11-pi-2',
    month: 11,
    type: 'pi',
    name: 'Paulownia Junk',
    nameKo: '오동 피',
    image: '/cards/m11-junk-2.webp',
  },
  {
    id: '11-pi-3',
    month: 11,
    type: 'pi',
    name: 'Paulownia Double Junk',
    nameKo: '오동 쌍피',
    tag: '쌍피',
    tagKo: '쌍피',
    typeLabel: 'Double junk ×2',
    typeLabelKo: '쌍피 ×2',
    image: '/cards/m11-double.webp',
  },

  // 12월 — 비
  {
    id: '12-gwang',
    month: 12,
    type: 'gwang',
    name: 'Rain Willow Bright',
    nameKo: '비 광',
    ...RAIN_BRIGHT,
    image: '/cards/m12-bright.webp',
    lore: 'Ono no Michikaze, a Heian-era calligrapher, sheltering under an umbrella. Watching a frog repeatedly leap at a willow branch taught him persistence — the moral of the picture.',
    loreKo:
      '헤이안 시대 서예가 오노노 미치카제(小野道風)가 우산을 쓴 모습. 버드나무에 자꾸 뛰어오르는 개구리를 보고 끈기를 배웠다는 일화가 그림에 담겼어요.',
  },
  {
    id: '12-kkeut',
    month: 12,
    type: 'kkeut',
    name: 'Rain Willow + Swallow',
    nameKo: '비 제비',
    image: '/cards/m12-animal.webp',
    lore: "A swallow against rain — the rain card's animal, traveling through storms.",
    loreKo: '빗속을 가르는 제비 — 비 카드의 동물.',
  },
  {
    id: '12-tti',
    month: 12,
    type: 'tti',
    name: 'Rain Willow Ribbon',
    nameKo: '비 띠',
    ...NO_COMBO,
    image: '/cards/m12-ribbon.webp',
  },
  {
    id: '12-pi',
    month: 12,
    type: 'pi',
    name: 'Rain Willow Double Junk',
    nameKo: '비 쌍피',
    tag: '쌍피',
    tagKo: '쌍피',
    typeLabel: 'Double junk ×2',
    typeLabelKo: '쌍피 ×2',
    image: '/cards/m12-double.webp',
  },
];
