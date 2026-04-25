export type Section = {
  id: string;
  num: string;
  label: string;
  labelKo: string;
  blurb: string;
  blurbKo: string;
};

export const SECTIONS: ReadonlyArray<Section> = [
  {
    id: "section-cards",
    num: "01",
    label: "What are hwatu cards?",
    labelKo: "화투 카드란?",
    blurb:
      "48 cards across 12 months — each illustrated with a flower, animal, or seasonal motif.",
    blurbKo:
      "12달 48장의 카드. 각 달마다 꽃, 동물, 계절 풍경이 그려져 있어요.",
  },
  {
    id: "section-flow",
    num: "02",
    label: "How a round works",
    labelKo: "한 판은 이렇게",
    blurb:
      "Deal, take turns, match cards by month, and stack what you've won.",
    blurbKo:
      "패를 분배하고, 차례대로 같은 월의 카드를 매칭하면서 먹어가요.",
  },
  {
    id: "section-scoring",
    num: "03",
    label: "Scoring",
    labelKo: "점수 계산",
    blurb:
      "Brights (광), ribbons (띠), animals (끗), and pip cards (피) — each scores differently.",
    blurbKo:
      "광·띠·끗·피 — 카드 종류마다 점수 매기는 방식이 달라요.",
  },
  {
    id: "section-special",
    num: "04",
    label: "Special rules",
    labelKo: "특수 룰",
    blurb:
      "Bombs, ttadak, jjok, and the 박 penalty system — small moves with big consequences.",
    blurbKo:
      "폭탄·따닥·쪽·박 시스템. 작은 움직임이 큰 결과로 이어지는 묘미.",
  },
  {
    id: "section-gostop",
    num: "05",
    label: "Go or Stop?",
    labelKo: "고냐 스톱이냐",
    blurb:
      "Hit 7 points and you choose: cash out, or push for double the score.",
    blurbKo:
      "7점이 되면 결정해요 — 멈출 것인가, 두 배를 노릴 것인가.",
  },
];
