import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateQuote, defaultOptions, sanitizeInput, type PerfumeOptions } from '../../src/lib/quote/engine';
import { loadPreviewFlow, QUOTE_PREVIEW_FLOW_STORAGE_KEY } from '../../src/lib/quote-preview/flow-storage';
import { PREVIEW_STORAGE_KEY } from '../../src/lib/quote-preview/model';

function inputWith(options: Partial<PerfumeOptions> = {}, days = 1) {
  return sanitizeInput({ days, region: 'seoul', hoursPerDay: 6, items: [{ key: 'acscent', options: {
    guests: 100, volume: '10ml', extraTeams: 0, customScent: false, premiumPackaging: false, ...options,
  } }] });
}

test('the default perfume experience has no signature-scent development fee', () => {
  const defaults = defaultOptions('acscent');
  assert.equal(defaults.key, 'acscent');
  if (defaults.key !== 'acscent') return;
  assert.equal(defaults.options.customScent, false);
  const quote = calculateQuote(inputWith(), 'en');
  assert.equal(quote.lines.some((line) => line.label === 'Custom scent design'), false);
  assert.equal(quote.supply, 1_850_000);
  assert.equal(quote.total, 2_035_000);
});

test('signature-scent development adds KRW 890,000 once regardless of guest count, bottle size, days or teams', () => {
  for (const guests of [20, 100, 350]) {
    for (const volume of ['10ml', '50ml'] as const) {
      for (const days of [1, 3]) {
        for (const extraTeams of [0, 2]) {
          const baseline = inputWith({ guests, volume, extraTeams }, days);
          const selected = inputWith({ guests, volume, extraTeams, customScent: true }, days);
          const original = structuredClone(selected);
          for (const lang of ['ko', 'en'] as const) {
            const basePrice = calculateQuote(baseline, lang);
            const price = calculateQuote(selected, lang);
            const lines = price.lines.filter((line) => line.label === (lang === 'ko' ? '커스텀 향 디자인' : 'Custom scent design'));
            assert.equal(lines.length, 1);
            assert.equal(lines[0].amount, 890_000);
            assert.equal(price.supply - basePrice.supply, 890_000);
            assert.equal(price.vat - basePrice.vat, 89_000);
            assert.equal(price.total - basePrice.total, 979_000);
          }
          assert.deepEqual(selected, original);
        }
      }
    }
  }
});

test('stored signature-scent selections retain their options and use the updated price when restored', () => {
  const source = inputWith({ guests: 300, volume: '50ml', customScent: true, customBox: true, analysisKiosks: 2, extraTeams: 2 }, 3);
  const original = structuredClone(source);
  const normalizedProduction = sanitizeInput(JSON.parse(JSON.stringify(source)));
  const restored = [normalizedProduction];
  for (const key of [QUOTE_PREVIEW_FLOW_STORAGE_KEY, PREVIEW_STORAGE_KEY]) {
    const value = JSON.stringify(key === PREVIEW_STORAGE_KEY ? { version: 1, input: source } : source);
    const loaded = loadPreviewFlow({ getItem: (requested) => requested === key ? value : null });
    assert.ok(loaded);
    restored.push(loaded);
  }
  for (const input of restored) {
    assert.deepEqual(input, source);
    const selected = calculateQuote(input, 'en');
    const withoutScent = calculateQuote(sanitizeInput({ ...input, items: input.items.map((item) => item.key === 'acscent'
      ? { ...item, options: { ...item.options, customScent: false } }
      : item) }), 'en');
    assert.equal(selected.lines.find((line) => line.label === 'Custom scent design')?.amount, 890_000);
    assert.equal(selected.total - withoutScent.total, 979_000);
  }
  assert.deepEqual(source, original);
});
