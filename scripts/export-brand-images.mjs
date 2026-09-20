// Makes the site's icons and share image from the mascot logo.
//
//   source:   assets-source/brand/club-go-stop.png  (never edited)
//   outputs:  src/app/favicon.ico            16, 32, 48px  (flower head, transparent)
//             src/app/icon.png               192px         (flower head on paper)
//             src/app/apple-icon.png         180px         (flower head on paper)
//             src/app/opengraph-image.png    1200x630      (share preview)
//             src/app/twitter-image.png      1200x630      (same picture)
//
// The flower head is cut out of the mascot along the red petals (grown a little so the ink outline
// stays in), so the arms, hands and feet are left out. Nothing is redrawn, recolored or stretched.
// Colors come from the palette table in src/app/globals.css, so a color change there carries over.
//
// The share image needs the real fonts, so it is laid out in Chrome. It downloads the two display
// fonts from Google Fonts into a temp folder. If Chrome is not at the path below, set CHROME_PATH.
//
// Run with:  node scripts/export-brand-images.mjs
import sharp from 'sharp';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(ROOT, 'assets-source/brand/club-go-stop.png');
const APP = join(ROOT, 'src/app');
const CHROME =
  process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// ── Colors and grain, read from globals.css ─────────────────────────────────
const css = readFileSync(join(APP, 'globals.css'), 'utf8');
const palette = (name, mode = 'light') => {
  const m = css.match(new RegExp(`--palette-${name}-${mode}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`Could not find --palette-${name}-${mode} in globals.css`);
  return m[1];
};
const PAPER = palette('paper');
const INK = palette('ink');
const PLUM = palette('plum');
const grain = css.match(/--grain-mask:\s*(url\("data:image\/svg\+xml;utf8,.*?"\));/s)?.[1];
const grainOpacity = css.match(/--grain-opacity:\s*([\d.]+)/)?.[1] ?? '0.05';
const inkSoftStrength = css.match(/--palette-ink-soft-light:\s*(\d+)%/)?.[1] ?? '72';

// ── The flower head, cut out of the mascot ──────────────────────────────────
const src = await sharp(SOURCE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = src.info;

// 1. Find the red petals.
const petals = Buffer.alloc(W * H);
for (let i = 0; i < W * H; i++) {
  const [r, g, b, a] = [
    src.data[i * 4],
    src.data[i * 4 + 1],
    src.data[i * 4 + 2],
    src.data[i * 4 + 3],
  ];
  if (a > 200 && r > 170 && g < 125 && b < 115) petals[i] = 255;
}
// 2. Grow them by about 18px so the dark outline stays in, and close the small gaps (face, stamens).
//    Anything farther from the petals (arms, legs, hands, feet) is left out.
const grownRaw = await sharp(petals, { raw: { width: W, height: H, channels: 1 } })
  .blur(14)
  .threshold(26)
  .raw()
  .toBuffer({ resolveWithObject: true });
const step = grownRaw.info.channels; // sharp may hand back more than one channel; read with the real stride
const maskRgba = Buffer.alloc(W * H * 4, 255);
for (let i = 0; i < W * H; i++) maskRgba[i * 4 + 3] = grownRaw.data[i * step];
const mask = await sharp(maskRgba, { raw: { width: W, height: H, channels: 4 } })
  .png()
  .toBuffer();
// 3. Keep only what is inside that shape, then trim the empty space.
const cutOut = await sharp(SOURCE)
  .ensureAlpha()
  .composite([{ input: mask, blend: 'dest-in' }])
  .png()
  .toBuffer();
// (a separate step: sharp trims before it composites, so trimming has to come after)
const trimmed = await sharp(cutOut)
  .trim({ threshold: 1 })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
// For the icons: almost-opaque pixels become fully opaque (alpha 250+), and the faintest edge glow
// (alpha under 110) is dropped, so the outline is crisp on paper instead of showing a gray rim.
for (let i = 3; i < trimmed.data.length; i += 4) {
  const a = trimmed.data[i];
  trimmed.data[i] = a >= 250 ? 255 : a < 110 ? 0 : a;
}
const head = await sharp(trimmed.data, {
  raw: { width: trimmed.info.width, height: trimmed.info.height, channels: 4 },
})
  .png()
  .toBuffer();
const headMeta = await sharp(head).metadata();
console.log(`flower head: ${headMeta.width}x${headMeta.height} (from ${W}x${H})`);

/** The head, fitted inside a square of `size` with `pad` (0-1) empty space around it. */
async function headSquare(size, pad, background) {
  const inner = Math.round(size * (1 - pad * 2));
  const sprite = await sharp(head)
    .resize({ width: inner, height: inner, fit: 'inside', kernel: 'lanczos3' })
    .sharpen({ sigma: 0.7 }) // the ink outline is thin; a light sharpen keeps it readable when small
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: sprite, gravity: 'centre' }])
    .png()
    .toBuffer();
}
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };

// ── Icons ───────────────────────────────────────────────────────────────────
writeFileSync(join(APP, 'icon.png'), await headSquare(192, 0.1, PAPER));
writeFileSync(join(APP, 'apple-icon.png'), await headSquare(180, 0.1, PAPER));

// favicon.ico: three PNGs in an ICO container.
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((s) => headSquare(s, 0.03, CLEAR)));
const dir = Buffer.alloc(6 + 16 * sizes.length);
dir.writeUInt16LE(1, 2); // type: icon
dir.writeUInt16LE(sizes.length, 4);
let offset = dir.length;
sizes.forEach((s, i) => {
  const e = 6 + i * 16;
  dir.writeUInt8(s, e); // width
  dir.writeUInt8(s, e + 1); // height
  dir.writeUInt16LE(1, e + 4); // planes
  dir.writeUInt16LE(32, e + 6); // bits per pixel
  dir.writeUInt32LE(pngs[i].length, e + 8);
  dir.writeUInt32LE(offset, e + 12);
  offset += pngs[i].length;
});
writeFileSync(join(APP, 'favicon.ico'), Buffer.concat([dir, ...pngs]));
console.log('wrote favicon.ico, icon.png, apple-icon.png');

// ── Share image (needs Chrome and the display fonts) ────────────────────────
if (!existsSync(CHROME)) {
  console.log(`Chrome not found at ${CHROME}. Skipped the share image (set CHROME_PATH).`);
  process.exit(0);
}
const work = mkdtempSync(join(tmpdir(), 'club-go-stop-brand-'));
async function ttf(spec, file) {
  const cssText = await (
    await fetch(`https://fonts.googleapis.com/css2?family=${spec}&display=swap`, {
      headers: { 'User-Agent': 'Mozilla/4.0' }, // an old browser gets one plain .ttf file
    })
  ).text();
  const url = cssText.match(/https:\/\/[^)']+\.ttf/)?.[0];
  if (!url) throw new Error(`No .ttf found for ${spec}`);
  writeFileSync(join(work, file), Buffer.from(await (await fetch(url)).arrayBuffer()));
}
await ttf('Fraunces:opsz,wght@144,600', 'fraunces.ttf'); // Latin display: 600, optical size 144
await ttf('Gowun+Batang:wght@700', 'gowun.ttf'); // Korean display: Bold
await ttf('IBM+Plex+Sans+KR:wght@500', 'plex.ttf'); // body
const mascot = await sharp(SOURCE).trim({ threshold: 1 }).resize({ height: 520 }).png().toBuffer();
writeFileSync(join(work, 'mascot.png'), mascot);
writeFileSync(
  join(work, 'og.html'),
  `<!doctype html><meta charset="utf-8"><style>
  @font-face{font-family:F;src:url(fraunces.ttf);font-weight:600}
  @font-face{font-family:G;src:url(gowun.ttf);font-weight:700}
  @font-face{font-family:P;src:url(plex.ttf);font-weight:500}
  html,body{margin:0;width:1200px;height:630px;background:${PAPER};overflow:hidden}
  .mascot{position:absolute;left:64px;top:55px;height:520px}
  .text{position:absolute;left:600px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center}
  .en{font:600 100px/1 F,serif;color:${PLUM};letter-spacing:-1px}
  .ko{font:700 58px/1.2 G,serif;color:${INK};margin-top:20px}
  .tag{font:500 28px/1.3 P,sans-serif;color:color-mix(in oklab,${INK} ${inkSoftStrength}%,transparent);margin-top:34px}
  .grain{position:absolute;inset:0;background:${INK};opacity:${grainOpacity};
    -webkit-mask-image:${grain};mask-image:${grain};-webkit-mask-size:220px 220px;mask-size:220px 220px}
  </style>
  <img class="mascot" src="mascot.png" alt="">
  <div class="text"><div class="en">Club Go Stop</div><div class="ko">클럽 고스톱</div>
  <div class="tag">A guide for our Go-Stop game nights</div></div>
  <div class="grain"></div>`,
);

// Drive Chrome through its debugging port (no extra packages needed).
const port = 9600 + Math.floor(Math.random() * 300);
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${join(work, 'profile')}`,
    '--no-first-run',
    '--disable-gpu',
    '--allow-file-access-from-files',
    'about:blank',
  ],
  { stdio: 'ignore' },
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
try {
  let target;
  for (let i = 0; i < 60 && !target; i++) {
    try {
      target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(
        (t) => t.type === 'page',
      );
    } catch {}
    if (!target) await sleep(200);
  }
  if (!target) throw new Error('Could not start Chrome');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const waiting = new Map();
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && waiting.has(d.id)) {
      waiting.get(d.id)(d);
      waiting.delete(d.id);
    }
  };
  const send = (method, params = {}) =>
    new Promise((res) => {
      const n = ++id;
      waiting.set(n, res);
      ws.send(JSON.stringify({ id: n, method, params }));
    });
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1200,
    height: 630,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send('Page.navigate', { url: `file://${join(work, 'og.html')}` });
  await sleep(800);
  await send('Runtime.evaluate', {
    expression: 'document.fonts.ready.then(() => true)',
    awaitPromise: true,
  });
  await sleep(400);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const og = Buffer.from(shot.result.data, 'base64');
  writeFileSync(join(APP, 'opengraph-image.png'), og);
  writeFileSync(join(APP, 'twitter-image.png'), og);
  console.log('wrote opengraph-image.png, twitter-image.png (1200x630)');
} finally {
  chrome.kill('SIGKILL');
}
