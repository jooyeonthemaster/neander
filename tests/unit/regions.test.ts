import assert from 'node:assert/strict';
import test from 'node:test';
import { COMMON, KIOSK, PERFUME, REGIONS, normalizeRegion } from '../../src/lib/quote/catalog';
import { calculateQuote, defaultOptions, sanitizeInput } from '../../src/lib/quote/engine';

const keys = REGIONS.map((r) => r.key);

test('six regions, each priced in every travel table', () => {
  assert.deepEqual(keys, ['seoul', 'gyeongin', 'central', 'eastGangwon', 'jeolla', 'gyeongsang']);
  for (const table of [PERFUME.teamTravel, COMMON.travel, KIOSK.travel]) {
    assert.deepEqual(Object.keys(table).sort(), [...keys].sort());
    assert.equal(table.seoul, Math.min(...Object.values(table)), 'Seoul is the cheapest base');
  }
});

test('legacy three-region values open with the same prices as before', () => {
  // 2026-09 이전 가견적서: capital(수도권) 35만·운송 0, south(전라·경상·강원 영동) 55만·운송 30만
  assert.equal(normalizeRegion('capital'), 'seoul');
  assert.equal(normalizeRegion('south'), 'jeolla');
  assert.equal(normalizeRegion('central'), 'central');
  assert.equal(normalizeRegion('unknown'), 'seoul');
  assert.equal(PERFUME.teamTravel[normalizeRegion('capital')], 350_000);
  assert.equal(PERFUME.teamTravel[normalizeRegion('south')], 550_000);
  assert.equal(COMMON.travel[normalizeRegion('south')], 300_000);
  assert.equal(sanitizeInput({ region: 'south' }).region, 'jeolla');
});

test('regional transport is charged once per event outside Seoul only', () => {
  for (const region of keys) {
    const quote = calculateQuote(sanitizeInput({ region, days: 2, items: [defaultOptions('photoBooth')] }));
    const line = quote.lines.find((l) => l.label === '지역 운송비');
    if (region === 'seoul') assert.equal(line, undefined);
    else assert.equal(line?.amount, COMMON.travel[region]);
  }
});
