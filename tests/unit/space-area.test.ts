import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateQuote, defaultOptions, sanitizeInput, type QuoteInput, type SpaceOptions } from '../../src/lib/quote/engine';
import { convertAreaFromPyeong, convertAreaToPyeong, formatSpaceArea, formatSpaceAreaEquivalent, normalizePyeong } from '../../src/lib/quote/space-area';
import { optionSummary } from '../../src/components/quote-studio/option-summary';
import { resolvePreview } from '../../src/lib/quote-preview/model';
import { loadPreviewFlow, QUOTE_PREVIEW_FLOW_STORAGE_KEY } from '../../src/lib/quote-preview/flow-storage';

function inputWith(options: Partial<SpaceOptions> = {}): QuoteInput {
  return sanitizeInput({
    days: 1, hoursPerDay: 6, attendees: 100, region: 'seoul', extraStaff: 0,
    items: [defaultOptions('acscent'), { key: 'spatialDesign', options: {
      size: 'large', pyeong: 10, photoZone: true, lighting: true, ...options,
    } }],
  });
}

test('conversions use the exact pyeong relation and do not clamp or round input quantities', () => {
  assert.equal(convertAreaFromPyeong(1, 'sqm'), 400 / 121);
  assert.equal(convertAreaToPyeong(1, 'sqm'), 0.3025);
  assert.equal(convertAreaToPyeong(100, 'sqm'), 30.25);
  assert.equal(convertAreaFromPyeong(30.25, 'sqm'), 100);
  assert.equal(convertAreaFromPyeong(30.123456, 'pyeong'), 30.123456);
  assert.equal(convertAreaToPyeong(30.123456, 'pyeong'), 30.123456);
  assert.equal(convertAreaToPyeong(10, 'sqm'), 3.025, 'conversion itself must not apply the 10-pyeong minimum');
});

test('canonical values preserve fractional area, clamp safely, and normalize idempotently', () => {
  assert.equal(normalizePyeong(30.12345678), 30.123457);
  assert.equal(normalizePyeong('30.25'), 30.25);
  assert.equal(normalizePyeong(0), 10);
  assert.equal(normalizePyeong(-10), 10);
  assert.equal(normalizePyeong(999), 500);
  for (const invalid of [undefined, NaN, Infinity, 'invalid']) assert.equal(normalizePyeong(invalid), 10);
  for (const value of [10, 30.25, 30.12345678, 499.9999999, 999]) {
    assert.equal(normalizePyeong(normalizePyeong(value)), normalizePyeong(value));
  }
});

test('formatters show the chosen unit and a two-decimal equivalent without changing the area', () => {
  const sqm = { pyeong: 30.25, areaUnit: 'sqm' as const };
  assert.equal(formatSpaceArea(sqm, 'ko'), '100㎡');
  assert.equal(formatSpaceAreaEquivalent(sqm, 'ko'), '30.25평');
  assert.equal(formatSpaceArea(sqm, 'en'), '100 m²');
  assert.equal(formatSpaceAreaEquivalent(sqm, 'en'), '30.25 pyeong');
  assert.equal(formatSpaceArea({ pyeong: 10 }, 'ko'), '10평');
  assert.equal(formatSpaceAreaEquivalent({ pyeong: 10 }, 'ko'), '33.06㎡');
  assert.deepEqual(sqm, { pyeong: 30.25, areaUnit: 'sqm' });
});

test('sanitization preserves valid selected units and old unitless draft shapes', () => {
  const legacy = inputWith().items.find((item) => item.key === 'spatialDesign')!.options;
  assert.equal(legacy.pyeong, 10);
  assert.ok(!('areaUnit' in legacy));
  for (const areaUnit of ['pyeong', 'sqm'] as const) {
    const options = inputWith({ pyeong: 30.12345678, areaUnit }).items.find((item) => item.key === 'spatialDesign')!.options;
    assert.equal(options.pyeong, 30.123457);
    assert.equal(options.areaUnit, areaUnit);
  }
  const invalid = sanitizeInput({ items: [{ key: 'spatialDesign', options: { pyeong: 20.5, areaUnit: 'feet' } }] });
  assert.ok(!('areaUnit' in invalid.items.find((item) => item.key === 'spatialDesign')!.options));
});

test('changing only the displayed unit leaves every charged amount and quote total unchanged', () => {
  const pyeongInput = inputWith({ pyeong: 30.25, areaUnit: 'pyeong' });
  const sqmInput = inputWith({ pyeong: 30.25, areaUnit: 'sqm' });
  const before = calculateQuote(pyeongInput);
  const after = calculateQuote(sqmInput);
  assert.deepEqual(after.lines.map(({ amount, tbd }) => ({ amount, tbd })), before.lines.map(({ amount, tbd }) => ({ amount, tbd })));
  assert.deepEqual([after.supply, after.vat, after.total], [before.supply, before.vat, before.total]);
  const line = after.lines.find((entry) => entry.service === 'spatialDesign')!;
  assert.match(line.detail, /별도 문의/);
  assert.equal(line.amount, 0);
  assert.equal(line.tbd, true);
  assert.equal(after.supply, after.lines.filter((entry) => !entry.tbd).reduce((sum, entry) => sum + entry.amount, 0));
});

test('fractional custom-space areas cannot add charges to automatically priced experiences', () => {
  const input = inputWith({ pyeong: normalizePyeong(convertAreaToPyeong(100.123, 'sqm')), areaUnit: 'sqm' });
  const result = calculateQuote(input);
  const estimated = result.lines.find((entry) => entry.service === 'spatialDesign')!;
  assert.equal(estimated.amount, 0);
  assert.equal(estimated.tbd, true);
  const original = calculateQuote(inputWith({ pyeong: 10 }));
  assert.deepEqual(result, original);
  const perfumeOnly = calculateQuote({ ...input, items: input.items.filter((item) => item.key === 'acscent') });
  assert.equal(result.total, perfumeOnly.total);
});

test('summary, preview and restored drafts retain the selected unit through repeated saves', () => {
  let input = inputWith({ pyeong: 30.25, areaUnit: 'sqm' });
  for (let index = 0; index < 10; index++) {
    const serialized = JSON.stringify(input);
    input = loadPreviewFlow({ getItem: (key) => key === QUOTE_PREVIEW_FLOW_STORAGE_KEY ? serialized : null })!;
    const space = input.items.find((item) => item.key === 'spatialDesign')!;
    assert.equal(space.options.pyeong, 30.25);
    assert.equal(space.options.areaUnit, 'sqm');
  }
  const item = input.items.find((entry) => entry.key === 'spatialDesign')!;
  assert.deepEqual(optionSummary(item, 'ko'), ['별도 문의 필요']);
  assert.ok(resolvePreview(input, 'combined', 'ko').badges.includes('맞춤 공간 · 100㎡'));
  assert.ok(resolvePreview(input, 'combined', 'en').notes.some((text) => text.includes('100 m²')));
});

// Restoring legacy venue choices must never revive their former automatic charges.
test('every restored space choice remains separately quoted across areas and units', () => {
  const booth = calculateQuote(inputWith({ size: 'booth6x3', photoZone: false, lighting: false }));
  for (const areaUnit of ['pyeong', 'sqm'] as const) {
    for (const pyeong of [0, 10, 10.5, 20, 500]) {
      const input = inputWith({ pyeong, areaUnit, photoZone: false, lighting: false });
      const restored = loadPreviewFlow({ getItem: (key) => key === QUOTE_PREVIEW_FLOW_STORAGE_KEY ? JSON.stringify(input) : null })!;
      const result = calculateQuote(restored);
      const base = result.lines.find((line) => line.service === 'spatialDesign')!;
      assert.equal(base.amount, 0);
      assert.equal(result.total, booth.total);
      assert.equal(base.tbd, true);
      assert.deepEqual(result, calculateQuote(input));
    }
  }
});
