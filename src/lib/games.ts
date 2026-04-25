export type GameId = "gostop" | "yutnori";

export type Game = {
  id: GameId;
  labelKo: string;
  labelEn: string;
  path: string;
};

export const GAMES: ReadonlyArray<Game> = [
  { id: "gostop",  labelKo: "고스톱", labelEn: "Go-Stop", path: "/gostop"  },
  { id: "yutnori", labelKo: "윷놀이", labelEn: "Yutnori", path: "/yutnori" },
];

export function getActiveGame(pathname: string): GameId {
  if (pathname.startsWith("/yutnori")) return "yutnori";
  return "gostop";
}
