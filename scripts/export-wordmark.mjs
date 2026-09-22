// Makes the web versions of the Club Go Stop wordmark logo (the hero's big lockup —
// not the small text <Wordmark> used in the header and sidebar).
//   source:  assets-source/brand/logo-wordmark.png  (never edited)
//   outputs: public/brand/wordmark-720.webp  (720px wide)
//            public/brand/wordmark-360.webp  (360px wide)
// The source has a solid `paper`-colored background baked in (no transparency). We trim
// the uniform border around the lockup, then resize. Run with:  node scripts/export-wordmark.mjs
import sharp from 'sharp';

const SOURCE = 'assets-source/brand/logo-wordmark.png';
const OUTPUTS = [
  { file: 'public/brand/wordmark-720.webp', width: 720, quality: 90 },
  { file: 'public/brand/wordmark-360.webp', width: 360, quality: 90 },
];

// Trim the uniform-color border around the lockup (sharp trims by the top-left pixel's
// color when no background is given — that pixel is the baked-in `paper` background).
const trimmed = await sharp(SOURCE).trim({ threshold: 8 }).toBuffer();
const trimmedMeta = await sharp(trimmed).metadata();
console.log(`trimmed: ${trimmedMeta.width}x${trimmedMeta.height}`);

for (const { file, width, quality } of OUTPUTS) {
  await sharp(trimmed).resize({ width }).webp({ quality, effort: 6 }).toFile(file);
  const out = await sharp(file).metadata();
  console.log(`${file}: ${out.width}x${out.height}`);
}
