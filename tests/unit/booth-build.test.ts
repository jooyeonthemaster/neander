import assert from 'node:assert/strict';
import test from 'node:test';
import { SPACE } from '../../src/lib/quote/catalog';
import { boothPrice, calculateQuote, sanitizeInput, startingPrice } from '../../src/lib/quote/engine';

const quoteFor = (options: Record<string, unknown>) =>
  calculateQuote(sanitizeInput({ region: 'seoul', days: 1, items: [{ key: 'spatialDesign', options }] }));

test('booths default to the modular fabric build and keep old saved options unchanged', () => {
  const saved = sanitizeInput({ items: [{ key: 'spatialDesign', options: { size: 'booth3x3', photoZone: false, lighting: false } }] });
  assert.deepEqual(saved.items[0].options, { size: 'booth3x3', pyeong: 10, photoZone: false, lighting: false });
  assert.equal(quoteFor({ size: 'booth3x3' }).supply, 0);
  assert.equal(quoteFor({ size: 'booth6x3', build: 'bogus' }).supply, 0);
  assert.equal(startingPrice('spatialDesign'), 0);
});

test('the retained booth catalog does not turn wooden-wall selections into online charges', () => {
  for (const size of ['booth3x3', 'booth6x3'] as const) {
    const wood = quoteFor({ size, build: 'wood' });
    assert.equal(wood.supply, 0);
    assert.equal(boothPrice(size, 'wood'), SPACE.woodBooth[size]);
    assert.ok(SPACE.woodBooth[size] > SPACE[size]);
    assert.equal(wood.lines[0].tbd, true);
    assert.equal(quoteFor({ size }).lines[0].tbd, true);
  }
});

test('custom spaces remain separately quoted for any legacy booth build', () => {
  assert.equal(quoteFor({ size: 'large', pyeong: 12, build: 'wood' }).supply, 0);
  assert.deepEqual(quoteFor({ size: 'large', pyeong: 12, build: 'wood' }), quoteFor({ size: 'large', pyeong: 12 }));
});
