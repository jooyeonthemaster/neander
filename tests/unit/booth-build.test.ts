import assert from 'node:assert/strict';
import test from 'node:test';
import { SPACE } from '../../src/lib/quote/catalog';
import { boothPrice, calculateQuote, sanitizeInput, startingPrice } from '../../src/lib/quote/engine';

const quoteFor = (options: Record<string, unknown>) =>
  calculateQuote(sanitizeInput({ region: 'seoul', days: 1, items: [{ key: 'spatialDesign', options }] }));

test('booths default to the modular fabric build and keep old saved options unchanged', () => {
  const saved = sanitizeInput({ items: [{ key: 'spatialDesign', options: { size: 'booth3x3', photoZone: false, lighting: false } }] });
  assert.deepEqual(saved.items[0].options, { size: 'booth3x3', pyeong: 10, photoZone: false, lighting: false });
  assert.equal(quoteFor({ size: 'booth3x3' }).supply, SPACE.booth3x3);
  assert.equal(quoteFor({ size: 'booth6x3', build: 'bogus' }).supply, SPACE.booth6x3);
  assert.equal(startingPrice('spatialDesign'), SPACE.booth3x3);
});

test('wooden walls are priced per size and never cheaper than the fabric booth', () => {
  for (const size of ['booth3x3', 'booth6x3'] as const) {
    const wood = quoteFor({ size, build: 'wood' });
    assert.equal(wood.supply, SPACE.woodBooth[size]);
    assert.equal(boothPrice(size, 'wood'), SPACE.woodBooth[size]);
    assert.ok(SPACE.woodBooth[size] > SPACE[size]);
    assert.match(wood.lines[0].detail, /나무 가벽/);
    assert.match(quoteFor({ size }).lines[0].detail, /조립식 천 부스/);
  }
});

test('custom spaces ignore the booth build', () => {
  assert.equal(quoteFor({ size: 'large', pyeong: 12, build: 'wood' }).supply, SPACE.perPyeong * 12);
});
