export type GameId = "gostop" | "yutnori";

export type Game = {
  id: GameId;
  labelKo: string;
  labelEn: string;
  path: string;
  /** WIP games are kept routable but hidden from public navigation. */
  hidden?: boolean;
};

export const GAMES: ReadonlyArray<Game> = [
  { id: "gostop",  labelKo: "고스톱", labelEn: "Go-Stop", path: "/gostop"  },
  // 윷놀이는 콘텐츠가 미완성 — 직접 URL로는 접근 가능하지만 nav에는 숨김.
  { id: "yutnori", labelKo: "윷놀이", labelEn: "Yutnori", path: "/yutnori", hidden: true },
];

/** Public-facing list (excludes hidden/WIP games). */
export const VISIBLE_GAMES = GAMES.filter((g) => !g.hidden);

export function getActiveGame(pathname: string): GameId {
  if (pathname.startsWith("/yutnori")) return "yutnori";
  return "gostop";
}
