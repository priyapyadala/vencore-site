/**
 * Copies all assets from vencore_images/ into public/images/ for the site.
 * Run: npm run sync:images (also runs automatically before build)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const srcDir = path.join(root, 'vencore_images');
const outDir = path.join(root, 'public', 'images');

/** @type {Record<string, string>} dest path → source filename */
const MAP = {
  // Page heroes
  'hero/hero-main.jpeg': 'hero1.jpeg',
  'hero/about-hero.jpeg': 'about1.jpeg',
  'hero/about-banner.jpeg': 'about2.jpeg',
  'hero/services-hero.jpeg': 'service1.jpeg',
  'hero/projects-hero.jpeg': 'hero2.jpeg',
  'hero/insights-hero.jpeg': 'hero4.jpeg',
  'hero/careers-hero.jpeg': 'office1.jpeg',
  'hero/contact-hero.jpeg': 'hero3.jpeg',
  'hero/hero-alt-5.jpeg': 'hero5.jpeg',
  'hero/hero-alt-6.jpeg': 'hero6.jpeg',
  'hero/hero-alt-7.jpeg': 'hero7.jpeg',

  // Service page alternates
  'reference/service-02.jpg': 'service2.jpeg',
  'reference/service-03.jpg': 'service3.jpeg',
  'reference/service-04.jpg': 'service4.jpeg',
  'reference/service-05.jpg': 'service5.jpeg',
  'reference/service-06.jpg': 'service6.jpeg',

  // Office
  'reference/office-01.jpg': 'office1.jpeg',
  'reference/office-02.jpg': 'office2.jpeg',
  'reference/office-03.jpg': 'office3.jpeg',
  'reference/office-04.jpg': 'office4.jpeg',
  'reference/office-05.jpg': 'office5.jpeg',
  'reference/office-06.jpg': 'office6.jpeg',

  // Residential / projects
  'reference/residential-01.jpg': 'proj1.jpeg',
  'reference/residential-02.jpg': 'proj2.jpeg',
  'reference/residential-03.jpg': 'proj3.jpeg',
  'reference/residential-04.jpg': 'proj4.jpeg',
  'reference/residential-05.jpg': 'proj5.jpeg',
  'reference/residential-06.jpg': 'proj6.jpeg',

  // Corporate
  'reference/corporate-01.jpg': 'corp1.jpeg',
  'reference/corporate-02.jpg': 'corp2.jpeg',
  'reference/corporate-03.jpg': 'corp3.jpeg',
  'reference/corporate-04.jpg': 'corp4.jpeg',
  'reference/corporate-05.jpg': 'corp5.jpeg',
  'reference/corporate-06.jpg': 'corp6.jpeg',

  // Hospitality
  'reference/experience-01.jpg': 'hosp1.jpeg',
  'reference/experience-02.jpg': 'hosp2.jpeg',
  'reference/experience-03.jpg': 'hosp3.jpeg',
  'reference/experience-04.jpg': 'hosp4.jpeg',
  'reference/experience-05.jpg': 'hosp5.jpeg',
  'reference/experience-06.jpg': 'hosp6.jpeg',
  'reference/experience-07.jpg': 'hosp7.jpeg',

  // Retail
  'reference/retail-01.jpg': 'retail1.jpeg',
  'reference/retail-02.jpg': 'retail2.jpeg',
  'reference/retail-03.jpg': 'retail3.jpeg',
  'reference/retail-04.jpg': 'retail4.jpeg',
  'reference/retail-05.jpg': 'retail5.jpeg',
  'reference/retail-06.jpg': 'retail6.jpeg',
  'reference/retail-07.jpg': 'retail7.jpeg',
  'reference/retail-08.jpg': 'retail8.jpeg',

  // Healthcare
  'reference/hospital-01.jpg': 'care1.jpeg',
  'reference/hospital-02.jpg': 'care2.jpeg',
  'reference/hospital-03.jpg': 'care3.jpeg',
  'reference/hospital-04.jpg': 'care4.jpeg',
  'reference/hospital-05.jpg': 'care5.jpeg',
  'reference/hospital-06.jpg': 'care6.jpeg',
};

async function copyPhoto(destRel, srcName) {
  const src = path.join(srcDir, srcName);
  const dest = path.join(outDir, destRel);
  if (!fs.existsSync(src)) {
    console.warn(`  skip (missing): ${srcName}`);
    return false;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const ext = path.extname(dest).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') {
    await sharp(src).rotate().jpeg({ quality: 85, mozjpeg: true }).toFile(dest);
    const base = dest.replace(/\.(jpe?g)$/i, '');
    const outExt = ext === '.jpg' ? '.jpg' : '.jpeg';
    for (const w of [480, 768, 1200]) {
      await sharp(src)
        .rotate()
        .resize({ width: w, withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(`${base}-w${w}${outExt}`);
    }
  } else {
    fs.copyFileSync(src, dest);
  }
  return true;
}

function whatsappFiles() {
  return fs
    .readdirSync(srcDir)
    .filter((f) => f.startsWith('WhatsApp') && /\.(jpe?g|png)$/i.test(f))
    .sort();
}

async function main() {
  if (!fs.existsSync(srcDir)) {
    console.warn('vencore_images/ not found — using existing public/images/ (CI/Vercel).');
    return;
  }

  let ok = 0;

  for (const [dest, src] of Object.entries(MAP)) {
    if (await copyPhoto(dest, src)) {
      console.log(`  ${src} → ${dest}`);
      ok++;
    }
  }

  const wa = whatsappFiles();
  for (let i = 0; i < wa.length; i++) {
    const dest = `reference/whatsapp-${String(i + 1).padStart(2, '0')}.jpg`;
    if (await copyPhoto(dest, wa[i])) {
      console.log(`  ${wa[i]} → ${dest}`);
      ok++;
    }
  }

  console.log(`Synced ${ok} images (${Object.keys(MAP).length} mapped + ${wa.length} WhatsApp) → public/images/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
