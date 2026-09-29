import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  CounterGlyph, KioskGlyph, PerfumeBottleGlyph, PhotoBoothGlyph, PhotoFrameGlyph,
  PlantGlyph, PrinterGlyph, TeamGlyph, palette,
} from '../src/components/quote-preview/illustrations/VectorPrimitives';

type Bounds = readonly [x: number, y: number, width: number, height: number];
interface AssetDefinition {
  id: string;
  category: 'equipment' | 'product' | 'staff' | 'furniture' | 'portrait';
  label: { ko: string; en: string };
  bounds: Bounds;
  content: ReactElement;
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destination = path.join(root, 'public/images/quote-preview/vector');
const component = 'src/components/quote-preview/illustrations/VectorPrimitives.tsx';
const sha256 = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
const definitions: AssetDefinition[] = [
  { id: 'kiosk', category: 'equipment', label: { ko: '분석 키오스크', en: 'Analysis kiosk' }, bounds: [-38, -171, 79, 184], content: <KioskGlyph /> },
  { id: 'perfumery-counter', category: 'furniture', label: { ko: '조향 테이블과 원료', en: 'Perfumery table and ingredients' }, bounds: [-111, -116, 228, 130], content: <CounterGlyph /> },
  { id: 'receipt-printer', category: 'equipment', label: { ko: '영수증형 프린터', en: 'Receipt printer' }, bounds: [-30, -47, 63, 60], content: <PrinterGlyph /> },
  { id: 'photo-booth', category: 'equipment', label: { ko: '행사 포토부스', en: 'Event photo booth' }, bounds: [-49, -190, 104, 205], content: <PhotoBoothGlyph /> },
  { id: 'photo-booth-wrapped', category: 'equipment', label: { ko: '브랜드 래핑 포토부스', en: 'Photo booth with brand wrapping' }, bounds: [-49, -190, 104, 205], content: <PhotoBoothGlyph wrapped /> },
  { id: 'plant', category: 'furniture', label: { ko: '공간 연출용 화분', en: 'Decorative plant' }, bounds: [-41, -110, 83, 123], content: <PlantGlyph /> },
];

for (const volume of ['10ml', '50ml'] as const) {
  for (const packaging of ['none', 'brand', 'custom'] as const) {
    const packagingLabel = packaging === 'none'
      ? { ko: '향수 병', en: 'bottle' }
      : packaging === 'brand' ? { ko: '브랜드 패키지', en: 'brand packaging' } : { ko: '전용 디자인 패키지', en: 'custom packaging' };
    definitions.push({
      id: `perfume-${volume}-${packaging}`, category: 'product',
      label: { ko: `${volume} ${packagingLabel.ko}`, en: `${volume} ${packagingLabel.en}` },
      // All perfume options share one canvas, preserving visual size on swaps.
      bounds: [-66, -137, 136, 153], content: <PerfumeBottleGlyph volume={volume} packaging={packaging} />,
    });
  }
}
for (let variant = 0; variant < 4; variant++) {
  definitions.push({
    id: `team-${variant + 1}`, category: 'staff',
    label: { ko: `조향사와 보조 한 팀 · 스타일 ${variant + 1}`, en: `Perfumer and assistant · variation ${variant + 1}` },
    bounds: [-74, -163, 148, 178], content: <TeamGlyph variant={variant} />,
  });
}
for (const style of ['source', 'ready', 'custom'] as const) {
  definitions.push({
    id: `portrait-${style}`, category: 'portrait',
    label: {
      ko: style === 'source' ? '변환 전 인물 예시' : style === 'ready' ? '기존 스타일 변환 예시' : '맞춤 보태니컬 스타일 예시',
      en: style === 'source' ? 'Source portrait example' : style === 'ready' ? 'Ready-made style example' : 'Custom botanical style example',
    },
    bounds: [-64, -150, 132, 164], content: <PhotoFrameGlyph style={style} />,
  });
}

async function main() {
  await mkdir(destination, { recursive: true });
  const componentHash = sha256(await readFile(path.join(root, component)));
  const assets = [];
  for (const definition of definitions.sort((a, b) => a.id.localeCompare(b.id, 'en'))) {
    const [left, top, width, height] = definition.bounds;
    const svg = '<?xml version="1.0" encoding="UTF-8"?>\n' + renderToStaticMarkup(
      <svg xmlns="http://www.w3.org/2000/svg" viewBox={definition.bounds.join(' ')} width={width} height={height}
        role="img" aria-label={definition.label.ko}>
        <title>{definition.label.ko}</title>
        <desc>견적 미리보기를 위한 편집 가능한 벡터 일러스트입니다. 실제 치수와 설치 배치는 상담 후 정합니다.</desc>
        {definition.content}
      </svg>,
    ) + '\n';
    // Reject external dependencies before publishing a reusable SVG file.
    if (/<image\b|<foreignObject\b|<script\b|\b(?:href|src)\s*=|url\(/i.test(svg)) {
      throw new Error(`${definition.id}: expected self-contained vector markup without external resources.`);
    }
    await writeFile(path.join(destination, `${definition.id}.svg`), svg);
    assets.push({
      id: definition.id, src: `/images/quote-preview/vector/${definition.id}.svg`,
      category: definition.category, label: definition.label,
      viewBox: [...definition.bounds], width, height,
      anchor: { kind: 'bottom-center', svgX: 0, svgY: 0, canvasX: -left, canvasY: -top },
      bytes: Buffer.byteLength(svg), sha256: sha256(svg),
      provenance: { kind: 'code-authored-vector-illustration', component, componentSha256: componentHash },
    });
  }
  await writeFile(path.join(destination, 'manifest.json'), JSON.stringify({
    version: 1,
    description: 'Editable vector illustration assets shared with the interactive quote preview. Transparent canvas; no embedded or external raster resources.',
    generator: 'scripts/export-quote-illustrations.tsx',
    palette,
    coordinateSystem: 'Each glyph has its ground contact at (0, 0); the viewBox includes stroke and shadow margins.',
    assetCount: assets.length,
    assets,
  }, null, 2) + '\n');
  console.log(`Exported ${assets.length} standalone SVG illustrations (${(assets.reduce((total, asset) => total + asset.bytes, 0) / 1024).toFixed(1)} KiB).`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
