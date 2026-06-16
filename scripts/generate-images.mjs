/**
 * Generates branded placeholder images for local dev / staging.
 * Replace files in public/images/ with real photography before production launch.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'public', 'images');

const palettes = {
  residential: ['#231509', '#5c3d2e', '#8b6914'],
  corporate: ['#12100e', '#2a2520', '#6b5a45'],
  experience: ['#1a1510', '#3d2e1f', '#9a7b4f'],
  retail: ['#181410', '#4a3528', '#c4a574'],
  hospital: ['#141820', '#2a3545', '#5a7a8a'],
  hero: ['#12100e', '#231509', '#4a3728'],
};

function svgPlaceholder(label, colors, w, h) {
  const [c1, c2, c3 = c2] = colors;
  const safe = label.replace(/[<>&'"]/g, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="55%" stop-color="${c2}"/>
      <stop offset="100%" stop-color="${c3}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <text x="50%" y="48%" text-anchor="middle" fill="#c4a574" font-family="Georgia, serif" font-size="${Math.round(w * 0.045)}" opacity="0.9">Vencore</text>
  <text x="50%" y="56%" text-anchor="middle" fill="#f7f0e4" font-family="system-ui, sans-serif" font-size="${Math.round(w * 0.028)}" letter-spacing="3" opacity="0.55">${safe}</text>
</svg>`;
}

async function writeImage(relPath, svg, format = 'jpeg') {
  const full = path.join(outDir, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  const buf = Buffer.from(svg);
  if (format === 'png') {
    await sharp(buf).png().toFile(full);
  } else {
    await sharp(buf).jpeg({ quality: 82 }).toFile(full);
  }
}

const referenceFiles = [
  ...Array.from({ length: 6 }, (_, i) => [`reference/residential-0${i + 1}.jpg`, 'Residential', palettes.residential]),
  ...Array.from({ length: 6 }, (_, i) => [`reference/corporate-0${i + 1}.jpg`, 'Corporate', palettes.corporate]),
  ...Array.from({ length: 4 }, (_, i) => [`reference/experience-0${i + 1}.jpg`, 'Hospitality', palettes.experience]),
  ...Array.from({ length: 4 }, (_, i) => [`reference/retail-0${i + 1}.jpg`, 'Retail', palettes.retail]),
  ...Array.from({ length: 4 }, (_, i) => [`reference/hospital-0${i + 1}.jpg`, 'Healthcare', palettes.hospital]),
];

async function main() {
  // Real logo: public/images/logo.png (not generated — add manually)
  await writeImage('hero/hero-main.jpeg', svgPlaceholder('Hero · Interior', palettes.hero, 1600, 1067));
  await writeImage('hero/about-hero.jpeg', svgPlaceholder('About · Studio', palettes.hero, 1600, 1067));

  for (const [rel, label, colors] of referenceFiles) {
    await writeImage(rel, svgPlaceholder(label, colors, 1200, 800));
  }

  console.log(`Generated ${referenceFiles.length + 2} placeholder images in public/images/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
