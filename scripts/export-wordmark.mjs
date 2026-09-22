// Makes the web versions of the wordmark logo lockups.
//   sources: assets-source/brand/logo-wordmark.png        (never edited) — the full lockup, hero
//            assets-source/brand/logo-wordmark-short.png  (never edited) — no "EST. 2026", sidebar
//   outputs: public/brand/wordmark-720.webp        (720px wide, hero)
//            public/brand/wordmark-360.webp        (360px wide, hero)
//            public/brand/wordmark-short-180.webp  (180px wide, sidebar / mobile top bar)
// Both sources have a solid `paper`-colored background baked in (no transparency). We trim
// the uniform border around the lockup, then resize. Run with:  node scripts/export-wordmark.mjs
import sharp from 'sharp';

const JOBS = [
  {
    source: 'assets-source/brand/logo-wordmark.png',
    outputs: [
      { file: 'public/brand/wordmark-720.webp', width: 720, quality: 90 },
      { file: 'public/brand/wordmark-360.webp', width: 360, quality: 90 },
    ],
  },
  {
    source: 'assets-source/brand/logo-wordmark-short.png',
    outputs: [{ file: 'public/brand/wordmark-short-180.webp', width: 180, quality: 90 }],
  },
];

for (const { source, outputs } of JOBS) {
  // Trim the uniform-color border around the lockup (sharp trims by the top-left pixel's
  // color when no background is given — that pixel is the baked-in `paper` background).
  const trimmed = await sharp(source).trim({ threshold: 8 }).toBuffer();
  const trimmedMeta = await sharp(trimmed).metadata();
  console.log(`${source} trimmed: ${trimmedMeta.width}x${trimmedMeta.height}`);

  for (const { file, width, quality } of outputs) {
    await sharp(trimmed).resize({ width }).webp({ quality, effort: 6 }).toFile(file);
    const out = await sharp(file).metadata();
    console.log(`  ${file}: ${out.width}x${out.height}`);
  }
}
