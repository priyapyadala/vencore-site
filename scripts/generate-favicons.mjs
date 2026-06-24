/**
 * Generates the full favicon / touch-icon set from the master logo mark.
 * Source: public/images/logo-original-1024.png (transparent wordmark).
 * Run once: node scripts/generate-favicons.mjs
 *
 * Produces (in public/):
 *   favicon.ico              (multi-res: 16, 32, 48)
 *   favicon-16x16.png
 *   favicon-32x32.png
 *   apple-touch-icon.png     (180x180, no transparency — iOS requirement)
 *   icon-192.png             (PWA / Android home screen)
 *   icon-512.png             (PWA / Android splash)
 *   site.webmanifest
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const src = path.join(root, 'public', 'images', 'logo-original-1024.png');
const outDir = path.join(root, 'public');

const PAPER = '#fbf7ef'; // matches --paper / --ivory brand background

// The full "dencotè Design Co." wordmark is illegible once scaled down to
// favicon sizes (16x16/32x32). Crop to just the leading ornamental glyph —
// the stylized character with the horizontal flourish — and use that alone
// as the icon mark, the same way most brands derive a favicon from a
// wordmark's initial letterform rather than the whole logotype.
const GLYPH_CROP = { left: 18, top: 28, width: 175, height: 260 };

async function squareOnPaper(size, { transparent = false } = {}) {
  const trimmed = await sharp(src).extract(GLYPH_CROP).toBuffer();
  const meta = await sharp(trimmed).metadata();
  const pad = Math.round(size * 0.14); // margin on each side
  const innerSize = size - pad * 2;
  const scale = Math.min(innerSize / meta.width, innerSize / meta.height);
  const resized = await sharp(trimmed)
    .resize(Math.round(meta.width * scale), Math.round(meta.height * scale))
    .toBuffer();
  const resizedMeta = await sharp(resized).metadata();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: transparent ? { r: 0, g: 0, b: 0, alpha: 0 } : PAPER,
    },
  })
    .composite([
      {
        input: resized,
        left: Math.round((size - resizedMeta.width) / 2),
        top: Math.round((size - resizedMeta.height) / 2),
      },
    ])
    .png()
    .toBuffer();
}

async function main() {
  if (!fs.existsSync(src)) {
    console.error(`Source logo not found: ${src}`);
    process.exit(1);
  }

  const sizes = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'apple-touch-icon.png': 180,
    'icon-192.png': 192,
    'icon-512.png': 512,
  };

  const buffers = {};
  for (const [name, size] of Object.entries(sizes)) {
    // apple-touch-icon must be fully opaque — iOS fills transparency with
    // black otherwise. Everything else can stay on the paper background too
    // for visual consistency across favicon/PWA icons.
    const buf = await squareOnPaper(size, { transparent: false });
    buffers[name] = buf;
    fs.writeFileSync(path.join(outDir, name), buf);
    console.log(`  ${name} (${size}x${size})`);
  }

  // favicon.ico: multi-resolution from 16/32/48
  const ico48 = await squareOnPaper(48, { transparent: false });
  const icoBuffer = await pngToIco([buffers['favicon-16x16.png'], buffers['favicon-32x32.png'], ico48]);
  fs.writeFileSync(path.join(outDir, 'favicon.ico'), icoBuffer);
  console.log('  favicon.ico (16/32/48 multi-res)');

  const manifest = {
    name: 'Vencore Design Co.',
    short_name: 'Vencore',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    theme_color: '#221c17',
    background_color: PAPER,
    display: 'standalone',
  };
  fs.writeFileSync(path.join(outDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');
  console.log('  site.webmanifest');

  console.log('\nDone. Favicon/touch-icon set generated in public/.');
}

main();
