"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Layers, Lock } from "lucide-react";
import { Button } from "@heroui/react";
import { useLocale } from "@/contexts/locale-context";
import { FadeInOnView } from "@/components/fade-in-on-view";
import { HWATU_DECK, type HwatuCard as HwatuCardData } from "@/lib/hwatu";

const cardById = (id: string): HwatuCardData => {
  const c = HWATU_DECK.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown card id: ${id}`);
  return c;
};

type StageState = {
  hand: string[];
  floor: string[];
  taken: string[];
  /** Top deck card mid-turn (visually face-up next to deck). */
  flipped?: string;
  deckCount: number;
  highlight?: {
    /** Hand cards to highlight (single id allowed for ergonomics). */
    hand?: string | string[];
    floor?: string[];
    taken?: string[];
    /** Floor cards that are locked (뻑) — rendered with rose styling. */
    locked?: string[];
  };
  /** "+N pi from each opponent" badge (쪽/따닥/폭탄). */
  bonusPi?: number;
};

type Step = {
  id: string;
  title: string;
  titleKo: string;
  desc: string;
  descKo: string;
  state: StageState;
};

type Scenario = {
  id: string;
  label: string;
  labelKo: string;
  blurb: string;
  blurbKo: string;
  steps: ReadonlyArray<Step>;
};

/* -------------------------------------------------------------------------- */
/* Scenarios                                                                   */
/* -------------------------------------------------------------------------- */

const HAND = ["01-gwang", "03-tti", "07-pi-1", "09-kkeut"];
const FLOOR_NORMAL = ["01-pi-1", "04-pi-1", "08-gwang", "11-pi-3"];

const NORMAL_STEPS: Step[] = [
  {
    id: "setup",
    title: "Deal the cards",
    titleKo: "패를 분배해요",
    desc:
      "In a 3-player game, each player gets 7 cards in hand. 8 cards lie face-up on the floor (바닥). The remaining 19 form the deck.",
    descKo:
      "3인 고스톱 기준 — 각자 7장씩 손패를 받고, 바닥(공유 영역)에는 8장이 펼쳐져요. 남은 19장은 더미.",
    state: { hand: HAND, floor: FLOOR_NORMAL, taken: [], deckCount: 19 },
  },
  {
    id: "pick",
    title: "Pick a card from your hand",
    titleKo: "손패에서 카드를 골라요",
    desc:
      "Look for a hand card whose month matches one on the floor. The 1월 광 in hand pairs with the 1월 피 on the floor.",
    descKo:
      "내 손패와 바닥에서 같은 월(月)의 카드를 찾아요. 1월 광(송학)이 바닥의 1월 피와 짝이 맞네요.",
    state: {
      hand: HAND,
      floor: FLOOR_NORMAL,
      taken: [],
      deckCount: 19,
      highlight: { hand: "01-gwang", floor: ["01-pi-1"] },
    },
  },
  {
    id: "match",
    title: "Take the matched pair",
    titleKo: "쌍을 먹어요",
    desc:
      "Both cards move to your taken pile. Cards are kept face-up so everyone can see your score.",
    descKo:
      "두 카드 모두 내 먹은 패로 들어가요. 먹은 패는 공개돼서 모두가 점수를 확인할 수 있어요.",
    state: {
      hand: ["03-tti", "07-pi-1", "09-kkeut"],
      floor: ["04-pi-1", "08-gwang", "11-pi-3"],
      taken: ["01-gwang", "01-pi-1"],
      deckCount: 19,
      highlight: { taken: ["01-gwang", "01-pi-1"] },
    },
  },
  {
    id: "flip",
    title: "Flip the top deck card",
    titleKo: "더미에서 한 장 뒤집어요",
    desc:
      "After playing, you flip the top card from the deck. If it matches a card on the floor, you take that pair too. Here, 5월 피 has no match — it joins the floor.",
    descKo:
      "손패를 낸 후, 더미 맨 위 카드를 뒤집어요. 바닥과 매치되면 또 한 쌍을 가져갈 수 있어요. 여기선 5월 피가 짝이 없어서 그냥 바닥에 놓여요.",
    state: {
      hand: ["03-tti", "07-pi-1", "09-kkeut"],
      floor: ["04-pi-1", "08-gwang", "11-pi-3"],
      taken: ["01-gwang", "01-pi-1"],
      deckCount: 18,
      flipped: "05-pi-1",
    },
  },
  {
    id: "end",
    title: "Turn ends",
    titleKo: "차례가 끝나요",
    desc:
      "Your turn passes. Once you reach 7 points, you'll decide: 고 (go for more) or 스톱 (stop and cash out).",
    descKo:
      "내 차례가 끝나고 다음 사람으로 넘어가요. 7점에 도달하면 결정해야 해요 — 고(계속) 또는 스톱(멈춤).",
    state: {
      hand: ["03-tti", "07-pi-1", "09-kkeut"],
      floor: ["04-pi-1", "08-gwang", "11-pi-3", "05-pi-1"],
      taken: ["01-gwang", "01-pi-1"],
      deckCount: 18,
    },
  },
];

const JJOK_HAND_INIT = ["01-gwang", "03-tti", "07-pi-1", "09-kkeut"];
const JJOK_FLOOR_INIT = ["04-pi-1", "08-gwang", "11-pi-3"]; // no 1월
const JJOK_HAND_AFTER = ["03-tti", "07-pi-1", "09-kkeut"];

const JJOK_STEPS: Step[] = [
  {
    id: "setup",
    title: "1월 광 in hand, no 1월 on floor",
    titleKo: "내 손엔 1월 광, 바닥엔 1월 없음",
    desc:
      "You hold the 1월 bright. Looking at the floor, there's no 1월 card to match against — so when you play it, it'll just join the floor.",
    descKo:
      "1월 광을 손에 들고 있어요. 바닥엔 1월이 하나도 없으니 그냥 광을 내면 바닥으로 가버리겠죠.",
    state: {
      hand: JJOK_HAND_INIT,
      floor: JJOK_FLOOR_INIT,
      taken: [],
      deckCount: 19,
      highlight: { hand: "01-gwang" },
    },
  },
  {
    id: "no-match",
    title: "Played — joins the floor",
    titleKo: "내고 보니 바닥행",
    desc:
      "You play the 1월 광. Without a partner on the floor, it sits face-up on the floor.",
    descKo:
      "1월 광을 냈지만 짝이 없어서 그대로 바닥에 놓여요.",
    state: {
      hand: JJOK_HAND_AFTER,
      floor: [...JJOK_FLOOR_INIT, "01-gwang"],
      taken: [],
      deckCount: 19,
      highlight: { floor: ["01-gwang"] },
    },
  },
  {
    id: "flip-match",
    title: "Flip — same month!",
    titleKo: "더미를 뒤집었더니… 같은 월!",
    desc:
      "Now you flip the top deck card. It's 1월 — same month as the card you just placed. That's 쪽 (jjok).",
    descKo:
      "더미를 뒤집었더니 1월! 방금 내가 낸 1월 광과 같은 월이에요. 이게 바로 쪽이에요.",
    state: {
      hand: JJOK_HAND_AFTER,
      floor: [...JJOK_FLOOR_INIT, "01-gwang"],
      taken: [],
      deckCount: 18,
      flipped: "01-pi-1",
      highlight: { floor: ["01-gwang"] },
    },
  },
  {
    id: "take-bonus",
    title: "Take both + bonus pi",
    titleKo: "둘 다 가져가고 보너스 피",
    desc:
      "Both 1월 cards go to your taken pile. Plus, every other player gives you one pi each — bonus reward for the lucky flip.",
    descKo:
      "두 카드 모두 내 먹은 패로. 추가로 상대방 한 명당 피 한 장씩 — 운 좋은 짝 만남에 대한 보너스예요.",
    state: {
      hand: JJOK_HAND_AFTER,
      floor: JJOK_FLOOR_INIT,
      taken: ["01-gwang", "01-pi-1"],
      deckCount: 18,
      highlight: { taken: ["01-gwang", "01-pi-1"] },
      bonusPi: 2,
    },
  },
];

const TTADAK_HAND_INIT = ["01-gwang", "03-tti", "07-pi-1", "09-kkeut"];
const TTADAK_FLOOR_INIT = ["01-pi-1", "01-pi-2", "04-pi-1", "08-gwang"]; // 2x 1월
const TTADAK_HAND_AFTER = ["03-tti", "07-pi-1", "09-kkeut"];

const TTADAK_STEPS: Step[] = [
  {
    id: "setup",
    title: "Two 1월 already on the floor",
    titleKo: "바닥에 1월이 벌써 2장",
    desc:
      "The floor already shows two 1월 pi cards (left over from earlier turns). You happen to be holding the 1월 bright.",
    descKo:
      "이전 차례들의 결과로 바닥엔 1월 피 2장이 있어요. 마침 내 손엔 1월 광이 들려있고요.",
    state: {
      hand: TTADAK_HAND_INIT,
      floor: TTADAK_FLOOR_INIT,
      taken: [],
      deckCount: 19,
      highlight: { hand: "01-gwang", floor: ["01-pi-1", "01-pi-2"] },
    },
  },
  {
    id: "match-three",
    title: "Match grabs all three",
    titleKo: "한 번에 3장",
    desc:
      "When you play your 1월 bright, it matches both floor cards. All three go into your taken pile.",
    descKo:
      "1월 광을 내면 바닥의 1월 두 장과 한꺼번에 매치돼요. 세 장 모두 내 먹은 패로.",
    state: {
      hand: TTADAK_HAND_AFTER,
      floor: ["04-pi-1", "08-gwang"],
      taken: ["01-gwang", "01-pi-1", "01-pi-2"],
      deckCount: 19,
      highlight: { taken: ["01-gwang", "01-pi-1", "01-pi-2"] },
      bonusPi: 2,
    },
  },
  {
    id: "flip-after",
    title: "Flip — no extra match",
    titleKo: "더미 뒤집기 — 추가 매치는 없음",
    desc:
      "You still flip the deck card afterwards. 5월 피 doesn't match anything on the floor — it just sits down. But the 따닥 already earned you bonus pi from each opponent.",
    descKo:
      "그리고 나서도 더미를 뒤집어요. 5월 피는 바닥과 안 맞아서 그대로 놓여요. 하지만 따닥으로 이미 상대 한 명당 피 1장씩 받았어요.",
    state: {
      hand: TTADAK_HAND_AFTER,
      floor: ["04-pi-1", "08-gwang", "05-pi-1"],
      taken: ["01-gwang", "01-pi-1", "01-pi-2"],
      deckCount: 18,
      bonusPi: 2,
    },
  },
];

const PPEOK_HAND_INIT = ["01-gwang", "03-tti", "07-pi-1", "09-kkeut"];
const PPEOK_FLOOR_INIT = ["01-pi-1", "04-pi-1", "08-gwang"]; // 1x 1월
const PPEOK_HAND_AFTER = ["03-tti", "07-pi-1", "09-kkeut"];

const PPEOK_STEPS: Step[] = [
  {
    id: "setup",
    title: "Hand match looks easy",
    titleKo: "손패 매치는 평범해 보여요",
    desc:
      "You hold the 1월 bright, and the floor has a 1월 pi. A normal pair-take, right?",
    descKo:
      "1월 광을 내려고 해요. 바닥에 1월 피가 한 장 있으니 평범한 쌍 매치 같죠?",
    state: {
      hand: PPEOK_HAND_INIT,
      floor: PPEOK_FLOOR_INIT,
      taken: [],
      deckCount: 19,
      highlight: { hand: "01-gwang", floor: ["01-pi-1"] },
    },
  },
  {
    id: "flip-third",
    title: "But the flip is also 1월!",
    titleKo: "근데 더미도 1월이네요?!",
    desc:
      "You flip the deck card right after. It's another 1월. That makes three 1월 cards on the floor at once — the situation locks.",
    descKo:
      "곧바로 더미를 뒤집었는데 그것도 1월. 바닥에 1월 카드가 한꺼번에 3장이 모이면 상황이 잠겨버려요.",
    state: {
      hand: PPEOK_HAND_AFTER,
      floor: [...PPEOK_FLOOR_INIT, "01-gwang"],
      taken: [],
      deckCount: 18,
      flipped: "01-pi-2",
      highlight: { floor: ["01-pi-1", "01-gwang"] },
    },
  },
  {
    id: "locked",
    title: "Three 1월 stuck on the floor",
    titleKo: "1월 3장이 바닥에 묶여요",
    desc:
      "All three 1월 cards now stay on the floor — nobody takes them. The next player who plays a 1월 card will sweep all four (the locked three plus their own).",
    descKo:
      "1월 3장이 그대로 바닥에 묶여요. 누구도 못 가져가요. 다음에 1월을 내는 사람이 (자기 카드까지 더해서) 4장 모두 가져갑니다.",
    state: {
      hand: PPEOK_HAND_AFTER,
      floor: ["04-pi-1", "08-gwang", "01-pi-1", "01-gwang", "01-pi-2"],
      taken: [],
      deckCount: 18,
      highlight: { locked: ["01-pi-1", "01-gwang", "01-pi-2"] },
    },
  },
];

const SWEEP_HAND_INIT = ["01-gwang", "07-pi-1", "09-kkeut"];
const SWEEP_HAND_AFTER = ["07-pi-1", "09-kkeut"];
const SWEEP_TAKEN_PRE = ["02-kkeut", "03-gwang", "04-pi-1"];

const SWEEP_STEPS: Step[] = [
  {
    id: "setup",
    title: "Late round, only one card on the floor",
    titleKo: "라운드 막바지, 바닥엔 1장뿐",
    desc:
      "Several turns in. Most floor cards have been taken throughout the round. Just a single 1월 피 remains — and you're holding the 1월 광.",
    descKo:
      "여러 턴이 지나 대부분의 카드가 정리됐어요. 바닥엔 1월 피 한 장만 남아있고, 마침 내 손엔 1월 광이 있어요.",
    state: {
      hand: SWEEP_HAND_INIT,
      floor: ["01-pi-1"],
      taken: SWEEP_TAKEN_PRE,
      deckCount: 6,
      highlight: { hand: "01-gwang", floor: ["01-pi-1"] },
    },
  },
  {
    id: "sweep",
    title: "Match clears the floor — 싹쓸이!",
    titleKo: "매치하면 바닥이 텅 비어요 — 싹쓸이!",
    desc:
      "Your 1월 광 takes the lone 1월 피. The floor is now empty — that's 싹쓸이 (sweep). Every opponent gives you one pi.",
    descKo:
      "1월 광이 마지막 1월 피와 매치되면서 바닥이 텅 비어요. 이게 싹쓸이! 상대 한 명당 피 1장씩 받아요.",
    state: {
      hand: SWEEP_HAND_AFTER,
      floor: [],
      taken: [...SWEEP_TAKEN_PRE, "01-gwang", "01-pi-1"],
      deckCount: 6,
      highlight: { taken: ["01-gwang", "01-pi-1"] },
      bonusPi: 2,
    },
  },
  {
    id: "flip",
    title: "Flip lands on empty floor",
    titleKo: "더미 뒤집기는 빈 바닥으로",
    desc:
      "After the sweep you still flip from the deck. 5월 피 has nothing to match — it sits down on the (briefly empty) floor.",
    descKo:
      "싹쓸이 후에도 더미는 뒤집어요. 5월 피는 짝이 없어서 (잠깐 비었던) 바닥에 그대로 놓여요.",
    state: {
      hand: SWEEP_HAND_AFTER,
      floor: ["05-pi-1"],
      taken: [...SWEEP_TAKEN_PRE, "01-gwang", "01-pi-1"],
      deckCount: 5,
      bonusPi: 2,
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Normal — double match (hand match + flip also matches)                      */
/* -------------------------------------------------------------------------- */

const DOUBLE_HAND_INIT = ["01-gwang", "05-tti", "07-pi-1", "09-kkeut"];
const DOUBLE_FLOOR_INIT = ["01-pi-1", "05-pi-1", "08-gwang", "11-pi-3"];
const DOUBLE_HAND_AFTER = ["05-tti", "07-pi-1", "09-kkeut"];

const DOUBLE_STEPS: Step[] = [
  {
    id: "setup",
    title: "Pick the 1월 bright",
    titleKo: "1월 광을 골라요",
    desc: "Floor has a 1월 피 — straightforward pair-take, just like the basic turn.",
    descKo:
      "바닥에 1월 피가 있어서 1월 광으로 매치하면 평범한 쌍 매치가 돼요.",
    state: {
      hand: DOUBLE_HAND_INIT,
      floor: DOUBLE_FLOOR_INIT,
      taken: [],
      deckCount: 19,
      highlight: { hand: "01-gwang", floor: ["01-pi-1"] },
    },
  },
  {
    id: "match",
    title: "Take the 1월 pair",
    titleKo: "1월 쌍을 먹어요",
    desc: "1월 광 + 1월 피 go to your taken pile.",
    descKo: "1월 광과 1월 피가 내 먹은 패로.",
    state: {
      hand: DOUBLE_HAND_AFTER,
      floor: ["05-pi-1", "08-gwang", "11-pi-3"],
      taken: ["01-gwang", "01-pi-1"],
      deckCount: 19,
      highlight: { taken: ["01-gwang", "01-pi-1"] },
    },
  },
  {
    id: "flip-match",
    title: "Flip is 5월 — also matches!",
    titleKo: "더미를 뒤집었더니 5월 — 매치!",
    desc:
      "You flip the deck. It's 5월 피, and the floor still has a 5월 piece. Lucky double match in one turn.",
    descKo:
      "더미를 뒤집었더니 5월 피. 바닥에 5월이 아직 있어서 또 한 쌍이 매치돼요. 한 턴에 두 쌍을 가져가는 운 좋은 차례.",
    state: {
      hand: DOUBLE_HAND_AFTER,
      floor: ["05-pi-1", "08-gwang", "11-pi-3"],
      taken: ["01-gwang", "01-pi-1"],
      deckCount: 18,
      flipped: "05-pi-2",
      highlight: { floor: ["05-pi-1"] },
    },
  },
  {
    id: "take-both",
    title: "Take 5월 pair too",
    titleKo: "5월 쌍도 먹어요",
    desc:
      "Both 5월 cards now join your taken pile. Four cards harvested in a single turn — no bonus pi though, since this isn't 쪽 or 따닥.",
    descKo:
      "5월 카드 두 장 모두 내 먹은 패로. 한 턴에 4장 수확! 단, 쪽이나 따닥이 아니라서 보너스 피는 없어요.",
    state: {
      hand: DOUBLE_HAND_AFTER,
      floor: ["08-gwang", "11-pi-3"],
      taken: ["01-gwang", "01-pi-1", "05-pi-2", "05-pi-1"],
      deckCount: 18,
      highlight: { taken: ["05-pi-2", "05-pi-1"] },
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Normal — no match (forced discard)                                          */
/* -------------------------------------------------------------------------- */

const NOMATCH_HAND_INIT = ["01-gwang", "03-tti", "07-pi-1", "09-kkeut"];
const NOMATCH_FLOOR_INIT = ["02-tti", "04-pi-1", "11-pi-3", "12-pi"];   
const NOMATCH_HAND_AFTER = ["03-tti", "07-pi-1", "09-kkeut"];

const NOMATCH_STEPS: Step[] = [
  {
    id: "setup",
    title: "No matching month in hand",
    titleKo: "손에 매치할 월이 없어요",
    desc:
      "Look at the floor — 2월, 4월, 11월, 12월. Your hand has 1월, 3월, 7월, 9월. Zero overlap.",
    descKo:
      "바닥은 2/4/11/12월. 내 손은 1/3/7/9월. 겹치는 월이 하나도 없어요.",
    state: {
      hand: NOMATCH_HAND_INIT,
      floor: NOMATCH_FLOOR_INIT,
      taken: [],
      deckCount: 19,
    },
  },
  {
    id: "discard",
    title: "Discard a card to the floor",
    titleKo: "한 장을 바닥에 버려요",
    desc:
      "When you can't match, you must still play a card from your hand — it just sits face-up on the floor for someone else to take later.",
    descKo:
      "매치할 수 없을 땐 그래도 손패 한 장은 내야 해요. 그 카드는 그냥 바닥에 놓여서 나중에 다른 사람이 가져갈 수 있어요.",
    state: {
      hand: NOMATCH_HAND_AFTER,
      floor: [...NOMATCH_FLOOR_INIT, "01-gwang"],
      taken: [],
      deckCount: 19,
      highlight: { floor: ["01-gwang"] },
    },
  },
  {
    id: "flip-no-match",
    title: "Flip the deck — also no match",
    titleKo: "더미 뒤집기 — 이것도 매치 없음",
    desc:
      "You still flip the top deck card. 7월 피 doesn't match any month on the floor either, so it joins the floor too. Empty-handed turn.",
    descKo:
      "더미도 뒤집어요. 7월 피도 바닥과 안 맞아서 바닥행. 한 장도 못 가져간 빈손 차례.",
    state: {
      hand: NOMATCH_HAND_AFTER,
      floor: [...NOMATCH_FLOOR_INIT, "01-gwang", "07-pi-2"],
      taken: [],
      deckCount: 18,
      highlight: { floor: ["07-pi-2"] },
    },
  },
];

/* -------------------------------------------------------------------------- */
/* 폭탄 (Pokdan) — 3 in hand + 1 on floor = bomb                                */
/* -------------------------------------------------------------------------- */

const POKDAN_HAND_INIT = ["01-gwang", "01-tti", "01-pi-1", "03-tti"];
const POKDAN_FLOOR_INIT = ["01-pi-2", "04-pi-1", "08-gwang"];
const POKDAN_HAND_AFTER = ["03-tti"];

const POKDAN_STEPS: Step[] = [
  {
    id: "setup",
    title: "Three 1월 in hand, one 1월 on floor",
    titleKo: "손엔 1월 3장, 바닥엔 1월 1장",
    desc:
      "You're holding three 1월 cards (광 + 띠 + 피). The fourth — a 1월 piece — is sitting on the floor. Bomb condition.",
    descKo:
      "내 손에 1월 카드가 3장 (광·띠·피). 그 월의 마지막 한 장이 바닥에 있어요. 폭탄 조건이에요.",
    state: {
      hand: POKDAN_HAND_INIT,
      floor: POKDAN_FLOOR_INIT,
      taken: [],
      deckCount: 19,
      highlight: {
        hand: ["01-gwang", "01-tti", "01-pi-1"],
        floor: ["01-pi-2"],
      },
    },
  },
  {
    id: "drop",
    title: "Drop all three at once",
    titleKo: "3장을 한꺼번에 던져요",
    desc:
      "Instead of one card per turn, you slam all three same-month cards down at once and sweep the floor card too. All four 1월 cards into your taken pile.",
    descKo:
      "보통 한 턴에 한 장씩 내지만, 폭탄은 같은 월 3장을 한꺼번에 내려놓고 바닥의 1장까지 함께 쓸어가요. 1월 4장 모두 내 먹은 패로.",
    state: {
      hand: POKDAN_HAND_AFTER,
      floor: ["04-pi-1", "08-gwang"],
      taken: ["01-gwang", "01-tti", "01-pi-1", "01-pi-2"],
      deckCount: 19,
      highlight: { taken: ["01-gwang", "01-tti", "01-pi-1", "01-pi-2"] },
      bonusPi: 2,
    },
  },
  {
    id: "flip",
    title: "Flip the deck — bonus pi already earned",
    titleKo: "더미 뒤집기 — 보너스 피는 이미 확보",
    desc:
      "You still flip a card afterwards. 5월 피 doesn't match — it joins the floor. The pokdan already earned you one pi from each opponent.",
    descKo:
      "그래도 더미는 뒤집어요. 5월 피는 매치 없어서 바닥행. 폭탄으로 이미 상대 한 명당 피 1장씩 챙긴 상태.",
    state: {
      hand: POKDAN_HAND_AFTER,
      floor: ["04-pi-1", "08-gwang", "05-pi-1"],
      taken: ["01-gwang", "01-tti", "01-pi-1", "01-pi-2"],
      deckCount: 18,
      bonusPi: 2,
    },
  },
];

/* -------------------------------------------------------------------------- */
/* 자뻑 (Self-ppeok) — hand play + own deck flip = same month                   */
/* -------------------------------------------------------------------------- */

const SELFPPEOK_HAND_INIT = ["01-gwang", "03-tti", "07-pi-1", "09-kkeut"];
const SELFPPEOK_FLOOR_INIT = ["04-pi-1", "08-gwang", "11-pi-3"];
const SELFPPEOK_HAND_AFTER = ["03-tti", "07-pi-1", "09-kkeut"];

const SELFPPEOK_STEPS: Step[] = [
  {
    id: "setup",
    title: "1월 광 in hand, no 1월 on floor",
    titleKo: "1월 광 손에, 바닥엔 1월 없음",
    desc:
      "You hold the 1월 bright. The floor has no 1월 — same starting point as 쪽 (jjok). Played card will land on the floor with no match.",
    descKo:
      "1월 광을 들고 있어요. 바닥엔 1월이 없어서 — 쪽과 똑같은 시작 — 카드를 내면 짝 없이 바닥에 놓여요.",
    state: {
      hand: SELFPPEOK_HAND_INIT,
      floor: SELFPPEOK_FLOOR_INIT,
      taken: [],
      deckCount: 19,
      highlight: { hand: "01-gwang" },
    },
  },
  {
    id: "play-no-match",
    title: "Play 1월 광 — joins floor",
    titleKo: "1월 광을 냈는데 짝 없음",
    desc: "1월 광 sits down on the floor with no partner.",
    descKo: "1월 광이 짝 없이 바닥에 놓여요.",
    state: {
      hand: SELFPPEOK_HAND_AFTER,
      floor: [...SELFPPEOK_FLOOR_INIT, "01-gwang"],
      taken: [],
      deckCount: 19,
      highlight: { floor: ["01-gwang"] },
    },
  },
  {
    id: "flip-self-match",
    title: "Flip is 1월 too — 자뻑!",
    titleKo: "더미도 1월 — 자뻑!",
    desc:
      "Now you flip the deck card and it's another 1월. Both came from YOU this turn (your hand-play + your own flip). That's 자뻑 (self-ppeok).",
    descKo:
      "더미 뒤집은 게 또 1월. 이번 턴에 둘 다 내가 만든 거예요 — 내가 낸 손패 + 내가 뒤집은 카드. 이게 자뻑.",
    state: {
      hand: SELFPPEOK_HAND_AFTER,
      floor: [...SELFPPEOK_FLOOR_INIT, "01-gwang"],
      taken: [],
      deckCount: 18,
      flipped: "01-pi-1",
      highlight: { floor: ["01-gwang"] },
    },
  },
  {
    id: "take-both",
    title: "Take both — but no opponent pi",
    titleKo: "둘 다 가져가지만 보너스 피는 없음",
    desc:
      "Since both 1월 cards came from your own actions, you take them — but unlike 쪽, you don't get bonus pi from each opponent. (Some house rules treat 자뻑 as locked floor instead — check your group's variant.)",
    descKo:
      "둘 다 내가 만든 1월이라 그대로 가져가요. 단, 쪽과 달리 상대 보너스 피는 없어요. (일부 룰셋에선 자뻑을 묶임 처리 — 모임 룰 확인.)",
    state: {
      hand: SELFPPEOK_HAND_AFTER,
      floor: SELFPPEOK_FLOOR_INIT,
      taken: ["01-gwang", "01-pi-1"],
      deckCount: 18,
      highlight: { taken: ["01-gwang", "01-pi-1"] },
    },
  },
];

const SCENARIOS: ReadonlyArray<Scenario> = [
  {
    id: "normal",
    label: "Normal turn",
    labelKo: "기본 흐름",
    blurb: "A vanilla turn with a single match.",
    blurbKo: "한 번 매치되는 평범한 차례.",
    steps: NORMAL_STEPS,
  },
  {
    id: "double",
    label: "Double match",
    labelKo: "더블 매치",
    blurb:
      "Hand play matches one floor card, then the deck flip also matches a different floor card. Two pairs in one turn.",
    blurbKo:
      "손패가 바닥과 매치된 후, 더미에서 뒤집은 카드도 바닥의 다른 카드와 매치. 한 턴에 두 쌍.",
    steps: DOUBLE_STEPS,
  },
  {
    id: "no-match",
    label: "No match",
    labelKo: "매치 없음",
    blurb:
      "Your hand has no matching month and the deck flip is also a miss. You discard a card and end the turn empty-handed.",
    blurbKo:
      "손에 매치할 월도 없고 더미 뒤집기도 빗나가요. 카드 한 장 버리고 빈손으로 차례 종료.",
    steps: NOMATCH_STEPS,
  },
  {
    id: "jjok",
    label: "쪽 (Jjok)",
    labelKo: "쪽",
    blurb:
      "Played hand card had no match — but the deck flip happens to be the same month. Take both, plus pi from each opponent.",
    blurbKo:
      "낸 손패는 짝이 없었는데 더미에서 뒤집은 게 같은 월. 두 장 모두 가져가고 상대 피 한 장씩.",
    steps: JJOK_STEPS,
  },
  {
    id: "ttadak",
    label: "따닥 (Ttadak)",
    labelKo: "따닥",
    blurb:
      "Two of the same month already on the floor — your matching play takes all three. Plus bonus pi.",
    blurbKo:
      "바닥에 같은 월 카드가 2장 있을 때 손에서 매치되는 카드를 내면 3장 모두 내 것. 보너스 피까지.",
    steps: TTADAK_STEPS,
  },
  {
    id: "ppeok",
    label: "뻑 (Ppeok)",
    labelKo: "뻑",
    blurb:
      "Hand-match plus a same-month flip = three-of-a-month on floor. Locked. The next player to play that month wins all four.",
    blurbKo:
      "손패 매치 + 더미도 같은 월 = 3장이 바닥에 묶여요. 다음에 그 월을 내는 사람이 다 쓸어가요.",
    steps: PPEOK_STEPS,
  },
  {
    id: "sweep",
    label: "싹쓸이 (Sweep)",
    labelKo: "싹쓸이",
    blurb:
      "Your match takes the last card on the floor — bonus pi from each opponent for clearing the table.",
    blurbKo:
      "내 매치가 바닥의 마지막 카드를 가져가서 텅 비게 돼요. 바닥을 청소한 상으로 상대 피 한 장씩.",
    steps: SWEEP_STEPS,
  },
  {
    id: "pokdan",
    label: "폭탄 (Pokdan)",
    labelKo: "폭탄",
    blurb:
      "Three same-month cards in your hand and the fourth on the floor — slam all three down at once and sweep all four. Bonus pi from each opponent.",
    blurbKo:
      "손에 같은 월 3장 + 바닥에 그 월의 마지막 1장. 3장을 한꺼번에 던져 4장 다 가져가요. 상대 피 보너스까지.",
    steps: POKDAN_STEPS,
  },
  {
    id: "self-ppeok",
    label: "자뻑 (Self-ppeok)",
    labelKo: "자뻑",
    blurb:
      "Your played card and your deck flip are the same month — both came from you this turn. Take both, but no opponent bonus pi.",
    blurbKo:
      "내가 낸 손패와 내가 뒤집은 카드가 같은 월 — 한 턴에 둘 다 내가 만들었어요. 둘 다 가져가지만 상대 보너스 피는 없음.",
    steps: SELFPPEOK_STEPS,
  },
];

/* -------------------------------------------------------------------------- */
/* Main section                                                                */
/* -------------------------------------------------------------------------- */

export function SectionFlow() {
  const { locale } = useLocale();
  const [scenarioId, setScenarioId] = useState<string>("normal");
  const [stepIndex, setStepIndex] = useState<number>(0);

  const scenario =
    SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];
  const step = scenario.steps[stepIndex];

  const switchScenario = (id: string) => {
    setScenarioId(id);
    setStepIndex(0);
  };
  const goPrev = () => setStepIndex((i) => Math.max(0, i - 1));
  const goNext = () =>
    setStepIndex((i) => Math.min(scenario.steps.length - 1, i + 1));

  return (
    <section
      id="section-flow"
      className="relative py-24 border-t border-foreground/10 section-flow-bg"
    >
      <div className="lg:ml-72">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-16">
      <FadeInOnView className="text-xs tabular-nums text-foreground/50 mb-4">
        SECTION 03
      </FadeInOnView>
      <FadeInOnView
        as="h2"
        delay={0.05}
        className="text-4xl md:text-5xl font-semibold tracking-tight mb-6"
      >
        {locale === "ko" ? "한 판은 이렇게" : "How a round works"}
      </FadeInOnView>
      <FadeInOnView
        as="p"
        delay={0.12}
        className="text-lg text-foreground/60 max-w-2xl leading-relaxed mb-8"
      >
        {locale === "ko"
          ? "한 턴의 흐름을 따라가 봐요. 기본 흐름부터 보고, 그 다음에 쪽·따닥·뻑 같은 변주들을 차례대로 클릭해보세요."
          : "Follow one turn from start to finish. Start with the normal flow, then explore the variations — jjok, ttadak, and ppeok."}
      </FadeInOnView>

      {/* Scenario selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {SCENARIOS.map((s) => {
          const isActive = scenario.id === s.id;
          return (
            <motion.button
              key={s.id}
              type="button"
              onClick={() => switchScenario(s.id)}
              whileTap={{ scale: 0.94 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                mass: 0.6,
              }}
              className={`relative px-3.5 py-1.5 rounded-full text-sm transition-colors ${
                isActive
                  ? "text-background font-medium"
                  : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10 hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="flow-scenario-pill"
                  className="absolute inset-0 rounded-full bg-foreground"
                  transition={{
                    type: "spring",
                    stiffness: 480,
                    damping: 28,
                    mass: 0.7,
                  }}
                />
              )}
              <span className="relative z-10">
                {locale === "ko" ? s.labelKo : s.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={scenario.id}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="text-sm text-foreground/55 mb-8 max-w-2xl leading-relaxed"
        >
          {locale === "ko" ? scenario.blurbKo : scenario.blurb}
        </motion.p>
      </AnimatePresence>

      <Stage state={step.state} />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${scenario.id}-${step.id}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            <h3 className="text-xl font-semibold tracking-tight mb-2">
              {locale === "ko" ? step.titleKo : step.title}
            </h3>
            <p className="text-sm text-foreground/70 leading-relaxed max-w-2xl">
              {locale === "ko" ? step.descKo : step.desc}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onPress={goPrev}
            isDisabled={stepIndex === 0}
          >
            <ChevronLeft className="size-4" />
            {locale === "ko" ? "이전" : "Prev"}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onPress={goNext}
            isDisabled={stepIndex === scenario.steps.length - 1}
          >
            {locale === "ko" ? "다음" : "Next"}
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2">
        {scenario.steps.map((s, i) => (
          <motion.button
            key={s.id}
            type="button"
            onClick={() => setStepIndex(i)}
            whileTap={{ scale: 0.85 }}
            aria-label={`Go to step ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === stepIndex
                ? "w-8 bg-foreground"
                : i < stepIndex
                  ? "w-4 bg-foreground/40"
                  : "w-4 bg-foreground/15 hover:bg-foreground/30"
            }`}
          />
        ))}
        <span className="ml-3 text-xs tabular-nums text-foreground/50">
          {stepIndex + 1} / {scenario.steps.length}
        </span>
      </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Stage                                                                       */
/* -------------------------------------------------------------------------- */

function Stage({ state }: { state: StageState }) {
  const { locale } = useLocale();
  return (
    <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-6 md:p-8 space-y-6">
      <Zone
        labelKo="바닥"
        labelEn="Floor"
        helpKo="공유되는 카드. 매치 대상이에요."
        helpEn="Shared face-up cards — match candidates."
        cardIds={state.floor}
        highlightedIds={state.highlight?.floor}
        lockedIds={state.highlight?.locked}
      />

      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-6 items-start">
        <DeckPile count={state.deckCount} flipped={state.flipped} />
        <Zone
          labelKo="먹은 패"
          labelEn="Taken"
          helpKo="내가 가져간 카드들. 광/띠/끗/피로 분류돼요."
          helpEn="Cards you've won. Sorted by type at score time."
          cardIds={state.taken}
          highlightedIds={state.highlight?.taken}
          empty={
            locale === "ko" ? "아직 먹은 패가 없어요" : "No cards taken yet"
          }
        />
        <BonusPiBadge count={state.bonusPi} />
      </div>

      <Zone
        labelKo="내 손패"
        labelEn="Your hand"
        helpKo="다른 플레이어에겐 안 보여요."
        helpEn="Hidden from other players."
        cardIds={state.hand}
        highlightedIds={
          state.highlight?.hand
            ? Array.isArray(state.highlight.hand)
              ? state.highlight.hand
              : [state.highlight.hand]
            : undefined
        }
      />
    </div>
  );
}

function Zone({
  labelKo,
  labelEn,
  helpKo,
  helpEn,
  cardIds,
  highlightedIds,
  lockedIds,
  empty,
}: {
  labelKo: string;
  labelEn: string;
  helpKo: string;
  helpEn: string;
  cardIds: string[];
  highlightedIds?: string[];
  lockedIds?: string[];
  empty?: string;
}) {
  const { locale } = useLocale();
  const isHighlighted = (id: string) => highlightedIds?.includes(id) ?? false;
  const isLocked = (id: string) => lockedIds?.includes(id) ?? false;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground/70">
          {locale === "ko" ? labelKo : labelEn}
        </div>
        <div className="text-[11px] text-foreground/45">
          {locale === "ko" ? helpKo : helpEn}
        </div>
      </div>
      {cardIds.length === 0 ? (
        <div className="rounded-md border border-dashed border-foreground/15 px-3 py-6 text-center text-xs text-foreground/40">
          {empty}
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          <AnimatePresence mode="popLayout">
            {cardIds.map((id) => (
              <MiniCard
                key={id}
                id={id}
                highlighted={isHighlighted(id)}
                locked={isLocked(id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function MiniCard({
  id,
  highlighted,
  locked,
}: {
  id: string;
  highlighted?: boolean;
  locked?: boolean;
}) {
  const card = cardById(id);
  return (
    <motion.div
      layout
      layoutId={`flow-${id}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: locked ? 0.6 : 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className={`relative aspect-[2/3] w-14 sm:w-16 rounded-md overflow-hidden ring-1 bg-white ${
        locked
          ? "ring-rose-400 outline outline-2 outline-offset-2 outline-rose-500"
          : highlighted
            ? "ring-black/10 outline outline-2 outline-offset-2 outline-amber-500"
            : "ring-black/10"
      }`}
    >
      <Image
        src={card.image}
        alt={card.nameKo}
        fill
        sizes="80px"
        className="object-cover"
      />
      {locked && (
        <div className="absolute top-0.5 right-0.5 bg-rose-500 text-white rounded-full p-0.5">
          <Lock className="size-2.5" />
        </div>
      )}
    </motion.div>
  );
}

function DeckPile({
  count,
  flipped,
}: {
  count: number;
  flipped?: string;
}) {
  const { locale } = useLocale();
  const flippedCard = flipped ? cardById(flipped) : null;

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground/70">
        {locale === "ko" ? "더미" : "Deck"}
      </div>
      <div className="relative h-24 w-16 sm:w-[72px]">
        <div
          className="absolute inset-0 rounded-md bg-zinc-700 ring-1 ring-black/20 flex items-center justify-center text-zinc-300"
          aria-hidden
        >
          <Layers className="size-5" />
        </div>
        <div className="absolute inset-x-0 -bottom-5 text-center text-[10px] tabular-nums text-foreground/50">
          ×{count}
        </div>
        <AnimatePresence>
          {flippedCard && (
            <motion.div
              key={flippedCard.id}
              layoutId={`flow-${flippedCard.id}`}
              initial={{ opacity: 0, x: 0, rotateY: 180, scale: 0.9 }}
              animate={{ opacity: 1, x: 80, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 22,
              }}
              style={{ zIndex: 50 }}
              className="absolute inset-0 rounded-md overflow-hidden ring-2 ring-amber-500 ring-offset-2 bg-white shadow-lg"
            >
              <Image
                src={flippedCard.image}
                alt={flippedCard.nameKo}
                fill
                sizes="80px"
                className="object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function BonusPiBadge({ count }: { count?: number }) {
  const { locale } = useLocale();
  return (
    <AnimatePresence>
      {count && count > 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 360, damping: 22 }}
          className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400 self-center"
        >
          <div className="font-semibold">
            +{count} {locale === "ko" ? "피 (보너스)" : "pi (bonus)"}
          </div>
          <div className="text-[10px] opacity-80 mt-0.5">
            {locale === "ko"
              ? "상대 한 명당 한 장씩"
              : "from each opponent"}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
