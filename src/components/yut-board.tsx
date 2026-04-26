"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLocale } from "@/contexts/locale-context";
import {
  OUTER_PATH,
  SHORTCUTS,
  STATIONS,
  getStation,
  type Station,
  type StationKind,
} from "@/lib/yut-board";

export type BoardHighlight = "none" | "outer" | "shortcut" | "corners";

export type PieceState = {
  /** Stable id used for React keys. */
  id?: string;
  /** Visited stations in order. The piece sits at the last entry. */
  history: ReadonlyArray<string>;
  /** Player color group. Defaults to "p1". */
  player?: "p1" | "p2";
  /** Stack count if this piece represents N pieces stacked together. */
  stack?: number;
  /** Marks a piece as having reached home (renders gold with a star). */
  completed?: boolean;
};

export function YutBoard({
  highlight = "none",
  piece,
  pieces,
}: {
  highlight?: BoardHighlight;
  piece?: PieceState;
  pieces?: ReadonlyArray<PieceState>;
}) {
  const allPieces = pieces ?? (piece ? [piece] : []);
  return (
    <svg
      viewBox="0 0 600 600"
      className="w-full h-auto"
      role="img"
      aria-label="Yutnori board"
    >
      <defs>
        <radialGradient id="board-bg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#fbf3df" />
          <stop offset="100%" stopColor="#e8d6a8" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width="600" height="600" rx="24" fill="url(#board-bg)" />

      {/* Outer ring connecting lines */}
      <g
        stroke="#8b6f47"
        strokeWidth={highlight === "outer" ? 5 : 3}
        fill="none"
        className="transition-all"
      >
        <line
          x1={50} y1={50} x2={550} y2={50}
          opacity={highlight === "outer" ? 1 : 0.55}
        />
        <line
          x1={550} y1={50} x2={550} y2={550}
          opacity={highlight === "outer" ? 1 : 0.55}
        />
        <line
          x1={550} y1={550} x2={50} y2={550}
          opacity={highlight === "outer" ? 1 : 0.55}
        />
        <line
          x1={50} y1={550} x2={50} y2={50}
          opacity={highlight === "outer" ? 1 : 0.55}
        />
      </g>

      {/* Diagonal shortcut lines */}
      <g
        stroke="#8b6f47"
        strokeWidth={highlight === "shortcut" ? 4 : 2}
        strokeDasharray={highlight === "shortcut" ? "0" : "6 5"}
        fill="none"
        className="transition-all"
      >
        <line
          x1={50} y1={50} x2={550} y2={550}
          opacity={highlight === "shortcut" ? 1 : 0.4}
        />
        <line
          x1={550} y1={50} x2={50} y2={550}
          opacity={highlight === "shortcut" ? 1 : 0.4}
        />
      </g>

      {/* Direction arrows on outer ring (only when outer is highlighted) */}
      {highlight === "outer" && (
        <DirectionArrows />
      )}

      {/* Animated path tracing */}
      {highlight === "outer" && (
        <motion.path
          d={pathD(OUTER_PATH)}
          stroke="#d97706"
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{ duration: 2.4, ease: "easeInOut" }}
        />
      )}
      {highlight === "shortcut" &&
        SHORTCUTS.map((path, i) => (
          <motion.path
            key={i}
            d={pathD(path)}
            stroke="#0ea5e9"
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.75 }}
            transition={{ duration: 1.6, ease: "easeInOut", delay: i * 0.2 }}
          />
        ))}

      {/* Stations */}
      <g>
        {STATIONS.map((station) => (
          <StationDot
            key={station.id}
            station={station}
            highlight={highlight}
          />
        ))}
      </g>

      {/* Pieces (rendered above stations so they're always visible) */}
      {allPieces.length > 0 && (
        <g>
          <AnimatePresence>
            {allPieces.map((p, i) => (
              <PieceMarker
                key={p.id ?? `piece-${i}`}
                piece={p}
                isSolo={allPieces.length === 1}
              />
            ))}
          </AnimatePresence>
        </g>
      )}
    </svg>
  );
}

function PieceMarker({
  piece,
  isSolo,
}: {
  piece: PieceState;
  isSolo: boolean;
}) {
  const history = piece.history;
  const [displayedIndex, setDisplayedIndex] = useState(0);

  // Walk through history at a fixed cadence so the piece "hops" station-by-station.
  useEffect(() => {
    if (displayedIndex >= history.length) return;
    const id = window.setTimeout(() => {
      setDisplayedIndex((i) => i + 1);
    }, 320);
    return () => window.clearTimeout(id);
  }, [displayedIndex, history.length]);

  // Reset displayedIndex when history shrinks (piece sent home, etc.).
  useEffect(() => {
    if (displayedIndex > history.length) setDisplayedIndex(history.length);
  }, [history.length, displayedIndex]);

  // Detect "going home" — history shrunk to 0 from a non-zero length.
  // Use a longer, more dramatic transition for that case.
  const prevHistoryLengthRef = useRef(history.length);
  const [returningHome, setReturningHome] = useState(false);
  useEffect(() => {
    const wasReset =
      history.length === 0 && prevHistoryLengthRef.current > 0;
    prevHistoryLengthRef.current = history.length;
    if (wasReset) {
      setReturningHome(true);
      const t = window.setTimeout(() => setReturningHome(false), 850);
      return () => window.clearTimeout(t);
    }
  }, [history.length]);

  const visited = history.slice(0, displayedIndex);
  const currentId = visited.length > 0 ? visited[visited.length - 1] : "start";
  const current = getStation(currentId);

  const player = piece.player ?? "p1";
  const completed = piece.completed ?? false;
  const stackCount = piece.stack ?? 1;

  const fill = completed
    ? "#fbbf24"
    : player === "p1"
      ? "#dc2626"
      : "#2563eb";
  const stroke = completed ? "#92400e" : "#fff";
  const traceColor = player === "p1" ? "#dc2626" : "#2563eb";

  const moveDuration = returningHome ? 0.75 : 0.28;
  const moveEase: [number, number, number, number] = returningHome
    ? [0.45, 0, 0.25, 1]
    : [0.5, 0, 0.5, 1];

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.32 }}
    >
      {/* Trace path — only when this is the only piece on the board. */}
      {isSolo && visited.length > 0 && !completed && (
        <motion.path
          d={tracePath(["start", ...visited])}
          stroke={traceColor}
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.35}
        />
      )}

      {/* The piece itself */}
      <motion.circle
        r={16}
        fill={fill}
        stroke={stroke}
        strokeWidth={3}
        initial={{ cx: getStation("start").x, cy: getStation("start").y }}
        animate={{ cx: current.x, cy: current.y }}
        transition={{ duration: moveDuration, ease: moveEase }}
        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))" }}
      />

      {/* Brief returning-home flash on top of the piece */}
      {returningHome && (
        <motion.circle
          r={20}
          fill={fill}
          opacity={0.5}
          initial={{ cx: current.x, cy: current.y, scale: 0.8 }}
          animate={{
            cx: current.x,
            cy: current.y,
            scale: [0.8, 2.2],
            opacity: [0.55, 0],
          }}
          transition={{ duration: 0.7, delay: 0.55 }}
        />
      )}

      {/* Star inside completed piece */}
      {completed && (
        <motion.text
          textAnchor="middle"
          animate={{ x: current.x, y: current.y + 4 }}
          transition={{ duration: 0.28, ease: [0.5, 0, 0.5, 1] }}
          style={{
            fontSize: 16,
            fontWeight: 700,
            fill: "#92400e",
            pointerEvents: "none",
          }}
        >
          ★
        </motion.text>
      )}

      {/* Stack badge (×N) — pops in when the count rises */}
      <AnimatePresence>
        {stackCount > 1 && (
          <motion.g
            key={`stack-${stackCount}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              x: current.x + 13,
              y: current.y - 13,
              scale: [0, 1.25, 1],
              opacity: 1,
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.36, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <circle r={9} fill="#fff" stroke={fill} strokeWidth={2} />
            <text
              textAnchor="middle"
              dy="0.34em"
              style={{
                fontSize: 10,
                fontWeight: 800,
                fill: fill,
              }}
            >
              ×{stackCount}
            </text>
          </motion.g>
        )}
      </AnimatePresence>
    </motion.g>
  );
}

function tracePath(stationIds: ReadonlyArray<string>): string {
  return stationIds
    .map((id, i) => {
      const s = getStation(id);
      return `${i === 0 ? "M" : "L"} ${s.x} ${s.y}`;
    })
    .join(" ");
}

function StationDot({
  station,
  highlight,
}: {
  station: Station;
  highlight: BoardHighlight;
}) {
  const { locale } = useLocale();
  const visual = stationVisual(station.kind, station.id, highlight);

  return (
    <g>
      <circle
        cx={station.x}
        cy={station.y}
        r={visual.r}
        fill={visual.fill}
        stroke={visual.stroke}
        strokeWidth={visual.strokeWidth}
        className="transition-all"
      />
      {station.nameKo && (
        <text
          x={station.x}
          y={station.y + visual.r + 18}
          textAnchor="middle"
          className="fill-foreground/70 select-none"
          style={{
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "inherit",
          }}
        >
          {locale === "ko" ? station.nameKo : station.nameEn}
        </text>
      )}
    </g>
  );
}

function stationVisual(
  kind: StationKind,
  id: string,
  highlight: BoardHighlight,
) {
  const cornerHighlighted =
    highlight === "corners" && (kind === "corner" || kind === "start");
  const onShortcut =
    highlight === "shortcut" &&
    SHORTCUTS.some((path) => path.includes(id));

  switch (kind) {
    case "start":
      return {
        r: cornerHighlighted ? 26 : 22,
        fill: "#d97706",
        stroke: "#7c2d12",
        strokeWidth: cornerHighlighted ? 4 : 2.5,
      };
    case "corner":
      return {
        r: cornerHighlighted ? 22 : 18,
        fill: "#fff7ed",
        stroke: cornerHighlighted ? "#dc2626" : "#9a6f43",
        strokeWidth: cornerHighlighted ? 4 : 2.5,
      };
    case "center":
      return {
        r: onShortcut ? 22 : 20,
        fill: onShortcut ? "#0ea5e9" : "#fefce8",
        stroke: onShortcut ? "#0c4a6e" : "#9a6f43",
        strokeWidth: onShortcut ? 4 : 2.5,
      };
    case "diagonal":
      return {
        r: onShortcut ? 14 : 12,
        fill: onShortcut ? "#0ea5e9" : "#fffbeb",
        stroke: onShortcut ? "#0c4a6e" : "#a18256",
        strokeWidth: onShortcut ? 3 : 1.5,
      };
    case "outer":
    default:
      return {
        r: highlight === "outer" ? 16 : 14,
        fill: "#fffbeb",
        stroke: highlight === "outer" ? "#d97706" : "#a18256",
        strokeWidth: highlight === "outer" ? 3 : 2,
      };
  }
}

function DirectionArrows() {
  // Counterclockwise from start (SE corner):
  // up the right column → left across top → down the left column → right across bottom.
  return (
    <g fill="#d97706" opacity={0.85}>
      {/* Right: pointing up (start → NE) */}
      <Arrow cx={555} cy={300} angle={270} />
      {/* Top: pointing left (NE → NW) */}
      <Arrow cx={300} cy={45} angle={180} />
      {/* Left: pointing down (NW → SW) */}
      <Arrow cx={45} cy={300} angle={90} />
      {/* Bottom: pointing right (SW → start) */}
      <Arrow cx={300} cy={555} angle={0} />
    </g>
  );
}

function Arrow({
  cx,
  cy,
  angle,
}: {
  cx: number;
  cy: number;
  angle: number;
}) {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${angle})`}>
      <polygon points="0,-5 8,0 0,5" />
    </g>
  );
}

function pathD(stationIds: ReadonlyArray<string>): string {
  return stationIds
    .map((id, i) => {
      const s = getStation(id);
      return `${i === 0 ? "M" : "L"} ${s.x} ${s.y}`;
    })
    .join(" ");
}
