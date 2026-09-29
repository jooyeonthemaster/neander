import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

/**
 * Web derivatives of reviewed transparent scene layers. No background removal.
 *
 * Default: discover output/quote-preview-assets/2026-09-28/layers/*.png
 * Explicit set: node scripts/prepare-perfume-scene-assets.mjs --map path/to/map.json
 * Map format: { "kiosk-real": "relative/to/map/kiosk.png", "team-1": "..." }
 * Source originals are preserved; no absolute/private source paths enter manifests.
 */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const collection = 'quote-preview-assets-2026-09-28';
const originals = path.join(root, 'output/quote-preview-assets/2026-09-28');
const originalLayers = path.join(originals, 'layers');
const destination = path.join(root, 'public/images/quote-preview/layers');
const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== '--map')) {
  throw new Error('Usage: node scripts/prepare-perfume-scene-assets.mjs [--map file-map.json]');
}

const sha256 = (data) => createHash('sha256').update(data).digest('hex');
let sources;
if (args.length) {
  const mapPath = path.resolve(args[1]);
  const map = JSON.parse(await readFile(mapPath, 'utf8'));
  if (!map || typeof map !== 'object' || Array.isArray(map)) throw new Error('File map must be an object of asset IDs to PNG paths.');
  sources = Object.entries(map).map(([id, source]) => {
    if (typeof source !== 'string' || !source.trim()) throw new Error(`Invalid PNG path for asset ${id}.`);
    return { id, source: path.resolve(path.dirname(mapPath), source) };
  });
} else {
  sources = (await readdir(originalLayers))
    .filter((name) => name.toLowerCase().endsWith('.png'))
    .map((name) => ({ id: name.slice(0, -4), source: path.join(originalLayers, name) }));
}
sources.sort((a, b) => a.id.localeCompare(b.id, 'en'));
if (!sources.length) throw new Error('No PNG scene layers found. Add reviewed originals first.');
for (const { id } of sources) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error(`Invalid asset ID: ${id}`);
}

function inspectAlpha(data, info) {
  const channel = info.channels - 1;
  let left = info.width;
  let top = info.height;
  let right = -1;
  let bottom = -1;
  let transparentPixels = 0;
  let nearOpaquePixels = 0;
  let maxAlpha = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const alpha = data[(y * info.width + x) * info.channels + channel];
      maxAlpha = Math.max(maxAlpha, alpha);
      if (alpha === 0) { transparentPixels++; continue; }
      if (alpha >= 245) nearOpaquePixels++;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }
  return {
    transparentPixels, nearOpaquePixels, maxAlpha,
    crop: right < 0 ? null : { left, top, width: right - left + 1, height: bottom - top + 1 },
  };
}

// Validate all inputs before writing derivatives, so an opaque failed generation
// cannot replace a working set or be mistaken for a transparent scene layer.
const prepared = [];
for (const { id, source } of sources) {
  const input = await readFile(source);
  const metadata = await sharp(input).metadata();
  if (metadata.format !== 'png' || !metadata.hasAlpha) throw new Error(`${id}: expected a PNG with a genuine alpha channel.`);
  const { data: pixels, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const alpha = inspectAlpha(pixels, info);
  if (!alpha.crop || !alpha.transparentPixels || !alpha.nearOpaquePixels) {
    throw new Error(`${id}: source must have transparent background pixels and near-opaque foreground pixels.`);
  }
  const { data, info: outputInfo } = await sharp(input)
    // Bounds are derived solely from alpha. Black product surfaces stay intact.
    .extract(alpha.crop)
    .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 90, alphaQuality: 100, effort: 5 })
    .toBuffer({ resolveWithObject: true });
  const outputMetadata = await sharp(data).metadata();
  if (!outputMetadata.hasAlpha) throw new Error(`${id}: derivative lost its alpha channel.`);
  prepared.push({
    id, input, source, data,
    manifest: {
      id, src: `/images/quote-preview/layers/${id}.webp`,
      kind: 'transparent-scene-layer',
      provenance: { kind: 'ai-generated-illustration', collection, originalSha256: sha256(input) },
      original: { width: info.width, height: info.height, alpha: { transparentPixels: alpha.transparentPixels, nearOpaquePixels: alpha.nearOpaquePixels, maxAlpha: alpha.maxAlpha } },
      crop: alpha.crop,
      width: outputInfo.width, height: outputInfo.height, hasAlpha: true,
      bytes: data.length, sha256: sha256(data),
    },
  });
}

await mkdir(destination, { recursive: true });
await mkdir(originalLayers, { recursive: true });
for (const { id, source, data } of prepared) {
  // Explicit file maps also archive the unmodified generation in this collection.
  const archived = path.join(originalLayers, `${id}.png`);
  if (path.resolve(source) !== archived) await copyFile(source, archived);
  await writeFile(path.join(destination, `${id}.webp`), data);
}

const manifest = {
  version: 1,
  description: 'Transparent generated layers for an illustrative perfume-event layout. Equipment appearance follows reviewed event references; placement is conceptual, not a measured plan.',
  generator: 'scripts/prepare-perfume-scene-assets.mjs',
  transforms: { trim: 'zero-alpha outer padding only', resize: 'fit within 1000 x 1000 without enlargement', format: 'webp', quality: 90, alphaQuality: 100, backgroundRemoval: false },
  assetCount: prepared.length,
  assets: prepared.map((asset) => asset.manifest),
};
const serialized = JSON.stringify(manifest, null, 2) + '\n';
await writeFile(path.join(destination, 'manifest.json'), serialized);
await writeFile(path.join(originals, 'layer-manifest.json'), serialized);
console.log(`Prepared ${prepared.length} transparent WebP scene layers (${(prepared.reduce((sum, item) => sum + item.data.length, 0) / 1024).toFixed(1)} KiB).`);
for (const { manifest: asset } of prepared) console.log(`${asset.id}: ${asset.original.width}x${asset.original.height} -> ${asset.width}x${asset.height}, alpha preserved, ${(asset.bytes / 1024).toFixed(1)} KiB`);
