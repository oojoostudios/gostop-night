// Makes the web versions of the Club Go Stop mascot.
//   source:  assets-source/brand/club-go-stop.png  (never edited)
//   outputs: public/brand/mascot-hero.webp  (480px wide)
//            public/brand/mascot-sm.webp    (96px wide)
// Pixels that are almost fully opaque (alpha 250 and up) are set to fully
// opaque. Run with:  node scripts/export-mascot.mjs
import sharp from 'sharp';

const SOURCE = 'assets-source/brand/club-go-stop.png';
const OUTPUTS = [
  { file: 'public/brand/mascot-hero.webp', width: 480, quality: 88 },
  { file: 'public/brand/mascot-sm.webp', width: 96, quality: 90 },
];

const solidify = (data) => {
  for (let i = 3; i < data.length; i += 4) if (data[i] >= 250) data[i] = 255;
};
const raw = (data, info) => ({ raw: { width: info.width, height: info.height, channels: 4 } });

const src = await sharp(SOURCE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
solidify(src.data);

for (const { file, width, quality } of OUTPUTS) {
  const small = await sharp(src.data, raw(src.data, src.info))
    .resize({ width })
    .raw()
    .toBuffer({ resolveWithObject: true });
  solidify(small.data); // resizing can soften edges; re-apply the rule at the final size
  await sharp(small.data, raw(small.data, small.info))
    .webp({ quality, alphaQuality: 100, effort: 6 })
    .toFile(file);
  const out = await sharp(file).metadata();
  console.log(`${file}: ${out.width}x${out.height}`);
}
