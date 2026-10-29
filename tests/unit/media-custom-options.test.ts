import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateQuote, sanitizeInput } from '../../src/lib/quote/engine';
import { normalizePreviewInput } from '../../src/lib/quote-preview/flow-storage';
import { resolveEventScene } from '../../src/lib/quote-preview/event-scene';
import { resolveServicePreview } from '../../src/lib/quote-preview/service-model';

for (const lang of ['ko', 'en'] as const) {
  test(`${lang}: legacy motion camera choices remain restorable without adding online charges`, () => {
    const quote = (sensorType: string, extraSensors = 0, days = 1) => calculateQuote(sanitizeInput({ days, items: [{ key: 'mediaArt', options: { sensorType, extraSensors } }] }), lang);
    const base = quote('image');
    assert.equal(base.total, 0);
    for (const sensorType of ['image', 'depth', 'invalid']) {
      for (const extraSensors of [0, 2, 10]) {
        assert.deepEqual(quote(sensorType, extraSensors, 3), base);
      }
    }
    assert.equal(base.lines[0].tbd, true);
    const input = normalizePreviewInput({ items: [{ key: 'mediaArt', options: { sensorType: 'depth', extraSensors: 3 } }] });
    const sensors = resolveEventScene(input)!.objects.filter(object => object.type === 'sensor');
    assert.equal(sensors.length, 4);
    assert.ok(sensors.every(sensor => sensor.sensorType === 'depth'));
    assert.ok(resolveServicePreview(input, 'mediaArt', lang)!.badges.some(badge => badge.includes('3D')));
    assert.deepEqual(normalizePreviewInput(JSON.parse(JSON.stringify(input))), input);
  });
  test(`${lang}: legacy custom scopes and options persist but need a separate inquiry with no online fees`, () => {
    const input = (options: object) => sanitizeInput({ days: 5, items: [{ key: 'custom', options }] });
    const base = calculateQuote(input({}), lang);
    const selected = input({ consulting: true, pgIntegration: true, maintenanceMonths: 2 });
    const quote = calculateQuote(selected, lang);
    assert.deepEqual(quote, base);
    assert.equal(quote.total, 0);
    assert.equal(quote.lines.length, 1);
    assert.equal(quote.lines[0].tbd, true);
    assert.ok(!quote.lines.some(line => line.service === 'common'));
    assert.deepEqual(normalizePreviewInput(JSON.parse(JSON.stringify(selected))), selected);
    assert.ok(resolveServicePreview(selected, 'custom', lang)!.badges.some(badge => /PG|Payment gateway/.test(badge)));
    assert.equal(calculateQuote(input({ pgIntegration: 'true' }), lang).total, base.total);
  });
}

test('old drafts default to the included image camera and no PG fee', () => {
  const input = sanitizeInput({ items: [{ key: 'mediaArt', options: {} }, { key: 'custom', options: {} }] });
  assert.equal(input.items[0].key === 'mediaArt' && input.items[0].options.sensorType, 'image');
  assert.equal(input.items[1].key === 'custom' && input.items[1].options.pgIntegration, false);
});
