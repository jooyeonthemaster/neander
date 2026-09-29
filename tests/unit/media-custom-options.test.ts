import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateQuote, sanitizeInput } from '../../src/lib/quote/engine';
import { normalizePreviewInput } from '../../src/lib/quote-preview/flow-storage';
import { resolveEventScene } from '../../src/lib/quote-preview/event-scene';
import { resolveServicePreview } from '../../src/lib/quote-preview/service-model';

for (const lang of ['ko', 'en'] as const) {
  test(`${lang}: motion camera choices price each included/extra set once per event`, () => {
    const quote = (sensorType: string, extraSensors = 0, days = 1) => calculateQuote(sanitizeInput({ days, items: [{ key: 'mediaArt', options: { sensorType, extraSensors } }] }), lang);
    const base = quote('image');
    assert.equal(quote('depth').total - base.total, 550_000);
    assert.equal(quote('image', 2).total - base.total, 660_000);
    assert.equal(quote('depth', 2).total - base.total, 2_310_000);
    assert.equal(quote('depth', 2, 3).total - quote('image', 0, 3).total, 2_310_000);
    assert.equal(quote('invalid').total, base.total);
    assert.match(quote('depth').lines.find(line => line.amount === 500_000)!.label, /3D/);
    const input = normalizePreviewInput({ items: [{ key: 'mediaArt', options: { sensorType: 'depth', extraSensors: 3 } }] });
    const sensors = resolveEventScene(input)!.objects.filter(object => object.type === 'sensor');
    assert.equal(sensors.length, 4);
    assert.ok(sensors.every(sensor => sensor.sensorType === 'depth'));
    assert.ok(resolveServicePreview(input, 'mediaArt', lang)!.badges.some(badge => badge.includes('3D')));
    assert.deepEqual(normalizePreviewInput(JSON.parse(JSON.stringify(input))), input);
  });
  test(`${lang}: custom planning and PG fees are additive, persist, and have no onsite charges`, () => {
    const input = (options: object) => sanitizeInput({ days: 5, items: [{ key: 'custom', options }] });
    const base = calculateQuote(input({}), lang);
    const selected = input({ consulting: true, pgIntegration: true, maintenanceMonths: 2 });
    const quote = calculateQuote(selected, lang);
    assert.equal(quote.total - base.total, 5_500_000);
    assert.equal(quote.lines.find(line => /PG 연결|Payment gateway/.test(line.label))!.amount, 1_000_000);
    assert.equal(quote.lines.find(line => /기획 컨설팅|Planning consultation/.test(line.label))!.amount, 3_000_000);
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
