// Slice the master hwatu deck SVG into 48 individual PNG files using
// Inkscape's geometry-aware raster export.
//
// Master deck: viewBox 0 0 3000 3300, laid out as 8 columns × 6 rows.
// Each cell: 375 wide × 550 tall (in viewBox coordinates).
//
// Output files: public/cards/cell-r{row}-c{col}.png at 300×440px (suitable
// for displaying at 75–150px on retina screens). After visually mapping
// cells → (month, type), rename to meaningful names like 01-gwang.png.

import { spawn } from "node:child_process";
import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const INPUT = path.join(ROOT, "public", "hwatu-deck.svg");
const OUT_DIR = path.join(ROOT, "public", "cards");

const COLS = 8;
const ROWS = 6;
const CELL_W = 3000 / COLS; // 375
const CELL_H = 3300 / ROWS; // 550
const EXPORT_WIDTH = 300;   // pixels — keeps card crisp at 1x and 2x display sizes

const INKSCAPE_PATHS = [
  "/opt/homebrew/bin/inkscape",
  "/Applications/Inkscape.app/Contents/MacOS/inkscape",
  "inkscape",
];

async function findInkscape() {
  for (const candidate of INKSCAPE_PATHS) {
    try {
      await new Promise((resolve, reject) => {
        const child = spawn(candidate, ["--version"], { stdio: ["ignore", "pipe", "pipe"] });
        child.on("error", reject);
        child.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))));
      });
      return candidate;
    } catch {}
  }
  throw new Error("Inkscape not found. Install: brew install --cask inkscape");
}

function runInkscape(bin, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (d) => (stderr += d));
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`inkscape exit ${code}: ${stderr}`));
    });
  });
}

async function main() {
  const inkscape = await findInkscape();
  console.log(`Using: ${inkscape}`);
  await mkdir(OUT_DIR, { recursive: true });

  // Clean stale test files from earlier exploration.
  for (const stale of ["test.png", "test-r0-c0.svg"]) {
    try { await unlink(path.join(OUT_DIR, stale)); } catch {}
  }

  const tasks = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x0 = col * CELL_W;
      const y0 = row * CELL_H;
      const x1 = x0 + CELL_W;
      const y1 = y0 + CELL_H;
      const out = path.join(OUT_DIR, `cell-r${row}-c${col}.png`);
      const args = [
        INPUT,
        `--export-area=${x0}:${y0}:${x1}:${y1}`,
        `--export-width=${EXPORT_WIDTH}`,
        `--export-filename=${out}`,
      ];
      tasks.push({ row, col, out, args });
    }
  }

  console.log(`Extracting ${tasks.length} cards to ${OUT_DIR}...`);
  let done = 0;
  for (const t of tasks) {
    await runInkscape(inkscape, t.args);
    done++;
    process.stdout.write(`\r  ${done}/${tasks.length}  (${path.basename(t.out)})        `);
  }
  process.stdout.write("\n");
  console.log("Done.");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
