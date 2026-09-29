import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateQuote, sanitizeInput, type PerfumeOptions, type QuoteInput, type SpaceOptions } from '../../src/lib/quote/engine';
import { createPreviewInput, PREVIEW_STORAGE_KEY, resolvePreview, type PreviewView } from '../../src/lib/quote-preview/model';

function configured(perfume: Partial<PerfumeOptions> = {}, space: Partial<SpaceOptions> = {}): QuoteInput {
  const input = createPreviewInput();
  input.items = input.items.map((item) => item.key === 'acscent'
    ? { ...item, options: { ...item.options, ...perfume } }
    : item.key === 'spatialDesign' ? { ...item, options: { ...item.options, ...space } } : item);
  return input;
}

test('combined descriptions preserve all structural selections and exact analysis kiosk counts', () => {
  const scenes = new Set<string>();
  for (const size of ['booth3x3', 'booth6x3'] as const) {
    for (const photoZone of [false, true]) {
      for (const lighting of [false, true]) {
        for (const analysisKiosks of [0, 1, 2, 3, 4]) {
          const model = resolvePreview(configured({ analysisKiosks }, { size, photoZone, lighting }), 'combined', 'ko');
          assert.equal(model.analysisKiosks, analysisKiosks);
          assert.ok(model.scene.alt.includes(size === 'booth6x3' ? '6 × 3 m' : '3 × 3 m'));
          assert.equal(model.badges.includes('포토존'), photoZone);
          assert.equal(model.badges.includes('추가 조명'), lighting);
          assert.doesNotMatch(JSON.stringify(model), /\/images\/|\.(webp|png|jpe?g|gif|avif)/);
          scenes.add(model.scene.id);
        }
      }
    }
  }
  assert.equal(scenes.size, 8);
});

test('space and overhead views explain structural options without promising measured equipment positions', () => {
  const scenes = new Set<string>();
  for (const size of ['booth3x3', 'booth6x3'] as const) {
    for (const photoZone of [false, true]) {
      for (const lighting of [false, true]) {
        for (const view of ['space', 'top'] as const) {
          const model = resolvePreview(configured({ analysisKiosks: 4 }, { size, photoZone, lighting }), view, 'en');
          assert.ok(model.notes.some((note) => note.includes('space structure')));
          assert.ok(model.badges.includes('4 analysis kiosks'));
          if (view === 'top') assert.ok(model.notes.some((note) => note.includes('not a measured floor plan')));
          scenes.add(model.scene.id);
        }
      }
    }
  }
  assert.equal(scenes.size, 16);
});

test('product descriptions respect volume, exclusive packaging and the shared 300-guest rule', () => {
  const products = new Set<string>();
  const labels = { none: '기본 무지 패키지', brand: "AC'SCENT 선물 포장", custom: '전용 디자인 단박스' };
  for (const volume of ['10ml', '50ml'] as const) {
    for (const packaging of ['none', 'brand', 'custom'] as const) {
      const model = resolvePreview(configured({ volume, guests: 300, premiumPackaging: packaging === 'brand', customBox: packaging === 'custom' }), 'combined', 'ko');
      assert.ok(model.product);
      assert.ok(model.product.label.includes(volume));
      assert.ok(model.product.label.includes(labels[packaging]));
      products.add(model.product.id);
    }
  }
  assert.equal(products.size, 6);
  const underMinimum = resolvePreview(configured({ guests: 299, premiumPackaging: true, customBox: true }), 'combined', 'ko');
  assert.ok(underMinimum.product?.label.includes(labels.none), 'Invalid custom packaging must not silently select brand packaging');
  const exclusive = resolvePreview(configured({ guests: 300, premiumPackaging: true, customBox: true }), 'combined', 'ko');
  assert.ok(exclusive.product?.label.includes(labels.custom));
});

test('custom-space metadata retains the selected area and defers actual fixture placement to consultation', () => {
  for (const view of ['combined', 'space', 'top'] as PreviewView[]) {
    const model = resolvePreview(configured({}, { size: 'large', pyeong: 120, photoZone: true, lighting: true }), view, 'ko');
    assert.ok(model.notes.some((note) => note.includes('120평')));
    assert.ok(model.notes.some((note) => note.includes('정확한 위치는 현장에서')));
    assert.ok(model.badges.includes('포토존'));
    assert.ok(model.badges.includes('추가 조명'));
  }
});

test('existing-venue and empty-state descriptions do not imply an unselected space purchase', () => {
  for (const analysisKiosks of [0, 4]) {
    const input = configured({ analysisKiosks });
    input.items = input.items.filter((item) => item.key === 'acscent');
    for (const view of ['combined', 'space', 'top'] as PreviewView[]) {
      const model = resolvePreview(input, view, 'ko');
      assert.ok(model.notes.some((note) => note.includes('별도 공간 디자인·시공은 선택하지')));
      assert.ok(!model.badges.some((badge) => /3 × 3|6 × 3/.test(badge)));
    }
  }
  const spaceOnly = createPreviewInput();
  spaceOnly.items = spaceOnly.items.filter((item) => item.key === 'spatialDesign');
  assert.equal(resolvePreview(spaceOnly, 'combined', 'en').product, null);
  const empty = resolvePreview({ ...spaceOnly, items: [] }, 'combined', 'ko');
  assert.equal(empty.product, null);
  assert.equal(empty.analysisKiosks, 0);
  assert.ok(empty.scene.label.includes('골라주세요'));
});

test('staffing and custom scent descriptors do not change the product, input or calculated quote', () => {
  const input = configured({ extraTeams: 2, customScent: true, analysisKiosks: 4 });
  const before = structuredClone(input);
  const priceBefore = calculateQuote(sanitizeInput(input), 'ko');
  const model = resolvePreview(input, 'combined', 'ko');
  assert.equal(model.product?.id, resolvePreview(createPreviewInput(), 'combined', 'ko').product?.id);
  assert.ok(model.badges.includes('조향 3팀 · 6명'));
  assert.ok(model.badges.includes('분석 키오스크 4대'));
  assert.ok(model.notes.some((note) => note.includes('조향사 1명과 보조 1명')));
  assert.ok(!model.notes.some((note) => note.includes('대표 기기 1대')));
  assert.equal(model.extras.length, 1);
  assert.ok(model.extras[0].label.includes('향'));
  assert.deepEqual(input, before);
  assert.deepEqual(calculateQuote(sanitizeInput(input), 'ko'), priceBefore);
});

test('preview defaults and bilingual descriptions remain isolated and contain no raster or private file references', () => {
  const first = createPreviewInput();
  const second = createPreviewInput();
  first.items.length = 0;
  assert.equal(second.items.length, 2);
  assert.equal(second.attendees, 100);
  assert.equal(PREVIEW_STORAGE_KEY, 'neander-quote-preview-v1');
  assert.notEqual(PREVIEW_STORAGE_KEY, 'neander-quote-v2');
  for (const lang of ['ko', 'en'] as const) {
    const model = resolvePreview(second, 'combined', lang);
    assert.ok(model.scene.id && model.scene.label && model.scene.alt);
    assert.ok(model.product?.label && model.product.alt);
    assert.doesNotMatch(JSON.stringify(model), /\/Users\/|\/images\/|\.(webp|png|jpe?g|gif|avif)/);
    assert.equal('src' in model.scene, false);
  }
});
