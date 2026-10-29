import assert from 'node:assert/strict';
import test from 'node:test';
import { CONSULTATION_SERVICES } from '../../src/lib/quote/catalog';
import { calculateQuote, defaultOptions, sanitizeInput, startingPrice } from '../../src/lib/quote/engine';

const consultationItems = [
  { key: 'spatialDesign', options: { size: 'large', pyeong: 500, build: 'wood', photoZone: true, lighting: true } },
  { key: 'mediaArt', options: { grade: 'fullCustom', sensorType: 'depth', extraSensors: 10 } },
  { key: 'custom', options: { scope: 'large', consulting: true, pgIntegration: true, maintenanceMonths: 36 } },
];

test('services requiring a separate inquiry have no online price or incidental fees', () => {
  for (const item of consultationItems) {
    const input = sanitizeInput({ items: [item], days: 60, hoursPerDay: 14, extraStaff: 30, setupDayBefore: true, region: 'gyeongsang' });
    for (const lang of ['ko', 'en'] as const) {
      const quote = calculateQuote(input, lang);
      assert.equal(quote.total, 0);
      assert.equal(quote.supply, 0);
      assert.equal(quote.vat, 0);
      assert.equal(quote.lines.length, 1);
      assert.equal(quote.lines[0].service, item.key);
      assert.equal(quote.lines[0].amount, 0);
      assert.equal(quote.lines[0].tbd, true);
      assert.match(quote.lines[0].detail, lang === 'ko' ? /별도 문의/ : /separate quote/);
    }
  }
  for (const key of CONSULTATION_SERVICES) assert.equal(startingPrice(key), 0);
});

test('restored consultation services cannot add fees to automatically priced experiences', () => {
  for (const key of ['acscent', 'photoBooth', 'rental'] as const) {
    const automatic = sanitizeInput({ items: [defaultOptions(key, 350)], days: 2, hoursPerDay: 8, extraStaff: 2, setupDayBefore: true, region: 'eastGangwon' });
    const restored = sanitizeInput({ ...automatic, items: [...automatic.items, ...consultationItems] });
    const before = calculateQuote(automatic);
    const after = calculateQuote(restored);
    assert.deepEqual([after.supply, after.vat, after.total], [before.supply, before.vat, before.total]);
    assert.deepEqual(after.lines.filter((line) => !line.tbd), before.lines);
    assert.equal(after.lines.filter((line) => line.tbd).length, 3);
  }
});

test('event names survive sanitization within the supported length without changing legacy event types', () => {
  assert.equal(sanitizeInput({ eventName: '  가을 팝업 행사  ', eventType: 'popup' }).eventName, '가을 팝업 행사');
  assert.equal(sanitizeInput({ eventName: '가'.repeat(250) }).eventName?.length, 200);
  assert.equal(sanitizeInput({ eventName: 123 }).eventName, undefined);
  const legacy = sanitizeInput({ eventType: 'festival' });
  assert.equal(legacy.eventType, 'festival');
  assert.equal(legacy.eventName, undefined);
});

test('new perfume selections use the expected participant count up to the supported limit', () => {
  for (const guests of [20, 100, 201, 600, 5000]) {
    const item = defaultOptions('acscent', guests);
    assert.equal(item.key, 'acscent');
    if (item.key === 'acscent') assert.equal(item.options.guests, guests);
  }
  const minimum = defaultOptions('acscent', 1);
  const maximum = defaultOptions('acscent', 10000);
  if (minimum.key === 'acscent') assert.equal(minimum.options.guests, 20);
  if (maximum.key === 'acscent') assert.equal(maximum.options.guests, 5000);
});
