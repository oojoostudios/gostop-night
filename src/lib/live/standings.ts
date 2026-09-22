import type { PlayerRow } from './types';

/**
 * Unlike Stage 1 (which replays a log to derive chip totals), the live players table already
 * stores each player's current `chips` and `buy_ins` — the database, kept in step by the
 * `record_hand` function, is the source of truth. These just format that for display.
 */
export type LiveStanding = {
  player: PlayerRow;
  bought: number;
  net: number;
  dollars: number;
  netDollars: number;
};

export function liveStandings(
  players: PlayerRow[],
  chipsPerBuyIn: number,
  chipVal: number,
): LiveStanding[] {
  return players.map((player) => {
    const bought = player.buy_ins * chipsPerBuyIn;
    return {
      player,
      bought,
      net: player.chips - bought,
      dollars: player.chips * chipVal,
      netDollars: (player.chips - bought) * chipVal,
    };
  });
}

export function liveBalance(players: PlayerRow[], chipsPerBuyIn: number) {
  const onTable = players.reduce((sum, p) => sum + p.chips, 0);
  const boughtIn = players.reduce((sum, p) => sum + p.buy_ins * chipsPerBuyIn, 0);
  return { onTable, boughtIn, diff: onTable - boughtIn, ok: onTable === boughtIn };
}
