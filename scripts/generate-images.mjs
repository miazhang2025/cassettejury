// One-off asset pipeline: juror thumbnails, WebP backgrounds, and the OG image.
// Run with: node scripts/generate-images.mjs
import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import path from 'path';

const PUBLIC = path.join(process.cwd(), 'public');
const JURY = path.join(PUBLIC, 'jury');
const THUMBS = path.join(JURY, 'thumbs');

async function generateThumbs() {
  await mkdir(THUMBS, { recursive: true });
  const files = (await readdir(JURY)).filter((f) => f.endsWith('.png'));
  for (const file of files) {
    const out = path.join(THUMBS, file.replace(/\.png$/, '.webp'));
    await sharp(path.join(JURY, file))
      .resize(512, 512, { fit: 'cover' })
      .webp({ quality: 82 })
      .toFile(out);
    console.log('thumb:', out);
  }
}

async function convertBackgrounds() {
  for (const name of ['velvet-bg', 'bg-mobile']) {
    const src = path.join(PUBLIC, `${name}.png`);
    const out = path.join(PUBLIC, `${name}.webp`);
    await sharp(src).webp({ quality: 80 }).toFile(out);
    console.log('background:', out);
  }
}

async function generateOgImage() {
  const src = path.join(PUBLIC, 'MacBook Pro 16_ - 1.png');
  const meta = await sharp(src).metadata();
  // Trim the cream mockup frame (~4% on each side) before the social crop
  const inset = Math.round(Math.min(meta.width, meta.height) * 0.04);
  await sharp(src)
    .extract({
      left: inset,
      top: inset,
      width: meta.width - inset * 2,
      height: meta.height - inset * 2,
    })
    .resize(1200, 630, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 85 })
    .toFile(path.join(PUBLIC, 'og.jpg'));
  console.log('og image: public/og.jpg');
}

await generateThumbs();
await convertBackgrounds();
await generateOgImage();
console.log('done');
