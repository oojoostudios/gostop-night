import type { GameId } from "@/lib/games";

export type Section = {
  id: string;
  num: string;
  label: string;
  labelKo: string;
  blurb: string;
  blurbKo: string;
};

const GOSTOP_SECTIONS: ReadonlyArray<Section> = [
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

const YUTNORI_SECTIONS: ReadonlyArray<Section> = [
  {
    id: "yut-sticks",
    num: "01",
    label: "What are yut sticks?",
    labelKo: "윷이란?",
    blurb:
      "Four wooden sticks, each round on one side and flat on the other. Throw them to find your move — 도, 개, 걸, 윷, or 모.",
    blurbKo:
      "한 면은 둥글고 반대 면은 평평한 막대 4개. 던져서 나오는 모양으로 움직여요 — 도, 개, 걸, 윷, 모.",
  },
  {
    id: "yut-board",
    num: "02",
    label: "The board",
    labelKo: "말판",
    blurb:
      "29 stations arranged in a cross. Shortcuts at the corners help your pieces home faster.",
    blurbKo:
      "십자 모양의 말판에 29개의 자리. 모서리의 지름길을 거치면 더 빨리 도착할 수 있어요.",
  },
  {
    id: "yut-flow",
    num: "03",
    label: "How a turn works",
    labelKo: "한 차례 흐름",
    blurb:
      "Throw the sticks, move a piece, hand over to the next player. 윷 and 모 give an extra throw.",
    blurbKo:
      "윷을 던지고, 말을 옮기고, 다음 사람에게 넘겨요. 윷·모는 한 번 더 던질 수 있어요.",
  },
  {
    id: "yut-strategy",
    num: "04",
    label: "Catching and stacking",
    labelKo: "잡기와 업기",
    blurb:
      "Land on an opponent's piece to send it back to the start. Land on your own to stack and travel together.",
    blurbKo:
      "상대 말 위에 떨어지면 그 말을 잡아 시작점으로 돌려보내요. 내 말 위에 떨어지면 업혀 함께 움직여요.",
  },
  {
    id: "yut-winning",
    num: "05",
    label: "How to win",
    labelKo: "이기는 법",
    blurb:
      "Get all four of your pieces around the board and back to the start.",
    blurbKo:
      "내 말 4개를 모두 한 바퀴 돌려 출발점으로 무사히 돌려보내면 승리.",
  },
];

export const SECTIONS_BY_GAME: Record<GameId, ReadonlyArray<Section>> = {
  gostop: GOSTOP_SECTIONS,
  yutnori: YUTNORI_SECTIONS,
};
