import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Produce web derivatives only. Keep the reviewed generated originals untouched.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const originals = path.join(root, 'output/quote-preview-assets/2026-09-27');
const destination = path.join(root, 'public/images/quote-preview');
const sources = [];
const add = (id, source, category) => sources.push({ id, source, category });

for (const size of ['3x3', '6x3']) {
  for (const configuration of ['base', 'photozone', 'lighting', 'full']) {
    for (const analysis of ['qr', 'kiosk']) {
      const id = `combined-${size}-${configuration}-${analysis}`;
      add(id, size === '6x3' && configuration === 'full'
        ? `combined/space-perfume-${analysis}.png`
        : `additions/combined/${id}.png`, 'combined');
    }
    const id = `space-${size}-${configuration}`;
    add(id, `spaces/${id}.png`, 'space');
    add(`${id}-top`, configuration === 'full'
      ? `spaces/space-${size}-top.png`
      : `additions/spaces/${id}-top.png`, 'space-top');
  }
}
for (const volume of ['10ml', '50ml']) {
  for (const packaging of ['none', 'brand', 'custom']) {
    const id = `perfume-${volume}-${packaging}`;
    add(id, `products/${id}.png`, 'product');
  }
}
for (const analysis of ['qr', 'kiosk']) {
  const id = `experience-neutral-${analysis}`;
  add(id, `additions/experience/${id}.png`, 'experience');
}
for (const id of ['custom-scent-development', 'space-site-survey']) {
  add(id, `second-pass/process/${id}.png`, 'process');
}
add('analysis-kiosk', 'products/analysis-kiosk.png', 'equipment');
add('photo-booth-event', 'equipment/photo-booth-event.png', 'equipment');
add('photo-booth-wrapped', 'additions/equipment/photo-booth-wrapped.png', 'equipment');
for (const id of ['booth-print-and-mobile', 'style-source-portrait', 'style-ready-anime', 'style-custom-botanical']) {
  add(id, `second-pass/photo/${id}.png`, 'photo-result');
}
for (const mode of ['event', 'monthly']) {
  for (const output of ['base', 'printer']) {
    const id = `rental-${mode}-${output}`;
    add(id, `second-pass/kiosk/${id}.png`, 'kiosk');
  }
}
add('media-sensor-setup', 'second-pass/media/media-sensor-setup.png', 'media');

await mkdir(destination, { recursive: true });
const assets = [];
// Bound conversion concurrency to avoid holding every full-resolution image in memory.
for (let start = 0; start < sources.length; start += 4) {
  const batch = await Promise.all(sources.slice(start, start + 4).map(async ({ id, source, category }) => {
    const input = await readFile(path.join(originals, source));
    const { data, info } = await sharp(input)
      .resize({ width: category === 'product' || category === 'equipment' ? 1000 : 1600, withoutEnlargement: true })
      .webp({ quality: 83, effort: 5 })
      .toBuffer({ resolveWithObject: true });
    await writeFile(path.join(destination, `${id}.webp`), data);
    return {
      id, src: `/images/quote-preview/${id}.webp`, category,
      provenance: { kind: 'ai-generated-illustration', collection: 'quote-preview-assets-2026-09-27', originalSha256: createHash('sha256').update(input).digest('hex') },
      width: info.width, height: info.height, bytes: data.length,
      sha256: createHash('sha256').update(data).digest('hex'),
    };
  }));
  assets.push(...batch);
}

await writeFile(path.join(destination, 'manifest.json'), JSON.stringify({
  version: 1,
  description: 'Illustrative quote previews. Composition and dimensions are conceptual, not a measured installation plan.',
  generator: 'scripts/prepare-quote-preview-assets.mjs',
  assetCount: assets.length,
  assets,
}, null, 2) + '\n');
console.log(`Prepared ${assets.length} WebP assets (${(assets.reduce((sum, item) => sum + item.bytes, 0) / 1024 / 1024).toFixed(2)} MiB).`);
