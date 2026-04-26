// Pure data about yut sticks and the six possible throw outcomes.

export type ThrowKind = {
  id: string;
  nameKo: string;
  nameEn: string;
  /** Stick states (true = flat-side up). Length 4. */
  sticks: ReadonlyArray<boolean>;
  /** Number of forward steps. Negative for 백도 (back-do). */
  move: number;
  /** Whether this throw earns a bonus throw. */
  extraThrow?: boolean;
  /** Optional variant: only triggered when the marked stick lands flat-up alone. */
  isBaekdo?: boolean;
  /** Index of the marked stick (only for 백도). */
  markedStickIndex?: number;
  desc: string;
  descKo: string;
};

export const THROWS: ReadonlyArray<ThrowKind> = [
  {
    id: 'do',
    nameKo: '도',
    nameEn: 'Do',
    sticks: [true, false, false, false],
    move: 1,
    desc: 'One stick flat-side up. The shortest move — one space.',
    descKo: '한 짝만 평평한 면이 위. 가장 짧게 1칸 이동해요.',
  },
  {
    id: 'gae',
    nameKo: '개',
    nameEn: 'Gae',
    sticks: [true, true, false, false],
    move: 2,
    desc: "Two sticks flat-up. 'Gae' shares a syllable with the Korean word for dog — a dog's stride.",
    descKo: "두 짝이 평평한 면이 위. '개(dog)' 한 글자 — 개 걸음 정도 보폭이라는 의미.",
  },
  {
    id: 'geol',
    nameKo: '걸',
    nameEn: 'Geol',
    sticks: [true, true, true, false],
    move: 3,
    desc: 'Three sticks flat-up. Three spaces forward.',
    descKo: '세 짝이 평평한 면이 위. 3칸 이동.',
  },
  {
    id: 'yut',
    nameKo: '윷',
    nameEn: 'Yut',
    sticks: [true, true, true, true],
    move: 4,
    extraThrow: true,
    desc: "All four sticks flat-up — 'yut' itself, the namesake throw. Move 4 spaces AND throw again.",
    descKo: "네 짝 모두 평평한 면이 위 — 게임 이름과 같은 '윷'. 4칸 이동 + 한 번 더 던지기.",
  },
  {
    id: 'mo',
    nameKo: '모',
    nameEn: 'Mo',
    sticks: [false, false, false, false],
    move: 5,
    extraThrow: true,
    desc: 'All four sticks round-side up (zero flat). The biggest move: 5 spaces and a bonus throw.',
    descKo: '네 짝 모두 둥근 면이 위 (평평한 면 0개). 가장 큰 점수 — 5칸 + 한 번 더.',
  },
  {
    id: 'baekdo',
    nameKo: '백도',
    nameEn: 'Baekdo',
    sticks: [true, false, false, false],
    isBaekdo: true,
    markedStickIndex: 0,
    move: -1,
    desc: 'Optional rule. One stick is marked. If only the marked stick lands flat-up while others stay round, you move BACKWARD one space.',
    descKo: '선택 룰. 한 짝에 표식이 있고, 그 표식 짝만 평평한 면이 위면 1칸 뒤로 이동해요.',
  },
];

/** Find a throw by id. Throws if the id is unknown — useful for static lookups. */
export function getThrow(id: string): ThrowKind {
  const t = THROWS.find((th) => th.id === id);
  if (!t) throw new Error(`Unknown throw id: ${id}`);
  return t;
}

/** Resolve a throw from the four stick states (ignoring 백도). */
export function resolveThrow(sticks: ReadonlyArray<boolean>): ThrowKind {
  const flatUp = sticks.filter(Boolean).length;
  switch (flatUp) {
    case 0:
      return getThrow('mo');
    case 1:
      return getThrow('do');
    case 2:
      return getThrow('gae');
    case 3:
      return getThrow('geol');
    case 4:
      return getThrow('yut');
    default:
      return THROWS[0];
  }
}
