/**
 * Generate PNG app icon sizes from SVG sources.
 * Run: node scripts/generate-app-icons.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

const ICON_SETS = [
  { svg: 'icon.svg', outputs: ['icon-sc-192.png', 'icon-sc-512.png'] },
  { svg: 'icons/store/gold-medal.svg', outputs: ['icons/store/gold-medal-192.png', 'icons/store/gold-medal-512.png'] },
  { svg: 'icons/store/neon-lane.svg', outputs: ['icons/store/neon-lane-192.png', 'icons/store/neon-lane-512.png'] },
  { svg: 'icons/store/trophy-splash.svg', outputs: ['icons/store/trophy-splash-192.png', 'icons/store/trophy-splash-512.png'] },
  { svg: 'icons/store/platinum-star.svg', outputs: ['icons/store/platinum-star-192.png', 'icons/store/platinum-star-512.png'] },
];

async function renderPng(svgPath, size, outputPath) {
  await sharp(svgPath)
    .resize(size, size)
    .png()
    .toFile(outputPath);
}

async function main() {
  for (const set of ICON_SETS) {
    const svgPath = path.join(PUBLIC, set.svg);
    const [out192, out512] = set.outputs;
    await renderPng(svgPath, 192, path.join(PUBLIC, out192));
    await renderPng(svgPath, 512, path.join(PUBLIC, out512));
    console.log(`Generated ${out192}, ${out512}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
