import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SERVICE_ORDER } from '../../src/lib/quote/catalog';
import { calculateQuote, defaultOptions, sanitizeInput } from '../../src/lib/quote/engine';
import { loadPreviewFlow, normalizePreviewInput, QUOTE_PREVIEW_FLOW_STORAGE_KEY } from '../../src/lib/quote-preview/flow-storage';
import { createPreviewInput, PREVIEW_STORAGE_KEY } from '../../src/lib/quote-preview/model';

function fakeStorage(values: Record<string, string> = {}) {
  const reads: string[] = [];
  return {
    reads,
    getItem(key: string) {
      reads.push(key);
      return values[key] ?? null;
    },
  };
}

test('a prior two-service experiment migrates without adding its parked space or losing options', () => {
  const input = createPreviewInput();
  input.items = [{ key: 'acscent', options: { guests: 350, volume: '50ml', extraTeams: 2, customScent: true, premiumPackaging: false, customBox: true, analysisKiosks: 2 } }];
  const storage = fakeStorage({
    [PREVIEW_STORAGE_KEY]: JSON.stringify({ version: 1, input, parkedSpace: defaultOptions('spatialDesign') }),
  });
  assert.deepEqual(loadPreviewFlow(storage), sanitizeInput(input));
  assert.deepEqual(storage.reads, [QUOTE_PREVIEW_FLOW_STORAGE_KEY, PREVIEW_STORAGE_KEY]);
});

test('migration accepts every supported service in a legacy experiment', () => {
  const input = sanitizeInput({ ...createPreviewInput(), items: SERVICE_ORDER.map((key) => defaultOptions(key)) });
  const storage = fakeStorage({ [PREVIEW_STORAGE_KEY]: JSON.stringify({ version: 1, input }) });
  const restored = loadPreviewFlow(storage);
  const expected = structuredClone(input);
  expected.items.find((item) => item.key === 'rental')!.options.experienceSlugs = [''];
  assert.deepEqual(restored, expected);
  assert.deepEqual(restored?.items.map((item) => item.key), SERVICE_ORDER);
});

test('the new flow draft wins over a legacy draft and retains all six services', () => {
  const current = sanitizeInput({ ...createPreviewInput(), days: 3, items: SERVICE_ORDER.map((key) => defaultOptions(key)) });
  current.items.find((item) => item.key === 'rental')!.options.experienceSlugs = [''];
  const storage = fakeStorage({
    [QUOTE_PREVIEW_FLOW_STORAGE_KEY]: JSON.stringify(current),
    [PREVIEW_STORAGE_KEY]: JSON.stringify({ version: 1, input: createPreviewInput() }),
  });
  assert.deepEqual(loadPreviewFlow(storage), current);
  assert.deepEqual(storage.reads, [QUOTE_PREVIEW_FLOW_STORAGE_KEY]);
});

test('an intentionally empty new draft never restores old selected services', () => {
  const current = sanitizeInput({ ...createPreviewInput(), items: [] });
  const storage = fakeStorage({
    [QUOTE_PREVIEW_FLOW_STORAGE_KEY]: JSON.stringify(current),
    [PREVIEW_STORAGE_KEY]: JSON.stringify({ version: 1, input: createPreviewInput() }),
  });
  assert.deepEqual(loadPreviewFlow(storage), current);
  assert.deepEqual(storage.reads, [QUOTE_PREVIEW_FLOW_STORAGE_KEY]);
});

test('restored flow drafts normalize invalid values and unknown or duplicate services', () => {
  const storage = fakeStorage({ [QUOTE_PREVIEW_FLOW_STORAGE_KEY]: JSON.stringify({
    days: -20, hoursPerDay: 100, attendees: '250', region: 'unknown', eventDate: 'tomorrow',
    items: [
      { key: 'rental', options: { kiosks: 999, months: -1, printer: true, mode: 'bad', branding: true } },
      { key: 'rental', options: { kiosks: 1 } },
      { key: 'removed-service', options: {} },
      { key: 'photoBooth', options: { booths: 99, photocard: true } },
    ],
  }) });
  const restored = loadPreviewFlow(storage);
  assert.ok(restored);
  assert.equal(restored.days, 1);
  assert.equal(restored.hoursPerDay, 14);
  assert.equal(restored.attendees, 250);
  assert.equal(restored.region, 'seoul');
  assert.equal(restored.eventDate, '');
  assert.deepEqual(restored.items.map((item) => item.key), ['rental', 'photoBooth']);
  const kiosk = restored.items.find((item) => item.key === 'rental');
  assert.equal(kiosk?.options.kiosks, 4);
  assert.equal(kiosk?.options.months, 1);
  assert.equal(kiosk?.options.mode, 'event');
  assert.equal(kiosk?.options.custom, 'brand');
  const booth = restored.items.find((item) => item.key === 'photoBooth');
  assert.equal(booth?.options.booths, 3);
  assert.equal(booth?.options.photocard, false);
});

test('preview inputs use event pricing while preserving kiosk assignments and other service choices', () => {
  const assignments = ['ai-personal-color', '', 'ai-face-reading', 'ai-personal-color'];
  const source = sanitizeInput({
    days: 3, hoursPerDay: 8, region: 'central',
    items: [
      { key: 'rental', options: { mode: 'monthly', months: 12, kiosks: 4, printer: true, custom: 'content', experienceSlugs: assignments } },
      { key: 'custom', options: { scope: 'large', consulting: true, maintenanceMonths: 12 } },
      defaultOptions('acscent'),
    ],
  });
  const original = structuredClone(source);
  const livePrice = calculateQuote(source, 'ko');
  const normalized = normalizePreviewInput(source);
  const kiosk = normalized.items.find((item) => item.key === 'rental');
  assert.ok(kiosk);
  assert.deepEqual(kiosk.options, {
    ...source.items.find((item) => item.key === 'rental')!.options,
    mode: 'event', months: 1, printer: false,
  });
  assert.deepEqual(normalized.items.filter((item) => item.key !== 'rental'), source.items.filter((item) => item.key !== 'rental'));

  const expectedEvent = sanitizeInput({ ...source, items: source.items.map((item) => item.key === 'rental'
    ? { ...item, options: { ...item.options, mode: 'event', months: 1, printer: false } }
    : item) });
  for (const lang of ['ko', 'en'] as const) {
    assert.deepEqual(calculateQuote(normalized, lang), calculateQuote(expectedEvent, lang));
  }
  assert.notEqual(calculateQuote(normalized, 'ko').total, livePrice.total);
  assert.deepEqual(source, original);
  assert.deepEqual(calculateQuote(source, 'ko'), livePrice, 'Production subscriptions remain supported by the shared engine');
  assert.deepEqual(normalizePreviewInput(normalized), normalized);
});

test('current and legacy subscription drafts migrate to event rental without touching production storage', () => {
  const source = sanitizeInput({ days: 2, items: [{ key: 'rental', options: {
    mode: 'monthly', months: 24, kiosks: 3, printer: true, custom: 'brand',
    experienceSlug: 'ai-face-reading', extraContents: 2,
  } }] });
  for (const storageKey of [QUOTE_PREVIEW_FLOW_STORAGE_KEY, PREVIEW_STORAGE_KEY]) {
    const values = {
      [storageKey]: JSON.stringify(storageKey === PREVIEW_STORAGE_KEY ? { version: 1, input: source } : source),
      'neander-quote-v2': JSON.stringify(source),
      'neander-estimates': '[{"no":"UNCHANGED"}]',
    };
    const original = structuredClone(values);
    const storage = fakeStorage(values);
    const restored = loadPreviewFlow(storage);
    assert.ok(restored);
    const kiosk = restored.items.find((item) => item.key === 'rental');
    assert.ok(kiosk);
    assert.deepEqual(kiosk.options, {
      mode: 'event', months: 1, kiosks: 3, printer: false, custom: 'brand',
      experienceSlug: 'ai-face-reading', experienceSlugs: ['ai-face-reading', '', ''], extraContents: 0,
    });
    assert.deepEqual(restored, normalizePreviewInput(source));
    assert.ok(!storage.reads.includes('neander-quote-v2') && !storage.reads.includes('neander-estimates'));
    assert.deepEqual(values, original);
    const roundtrip = loadPreviewFlow(fakeStorage({ [QUOTE_PREVIEW_FLOW_STORAGE_KEY]: JSON.stringify(restored) }));
    assert.deepEqual(roundtrip, restored);
  }
});

test('invalid current drafts fail safely without unexpectedly reviving a legacy selection', () => {
  for (const current of ['{broken', 'null', '[]', '{"items":{}}']) {
    const storage = fakeStorage({
      [QUOTE_PREVIEW_FLOW_STORAGE_KEY]: current,
      [PREVIEW_STORAGE_KEY]: JSON.stringify({ version: 1, input: createPreviewInput() }),
    });
    assert.equal(loadPreviewFlow(storage), null);
    assert.deepEqual(storage.reads, [QUOTE_PREVIEW_FLOW_STORAGE_KEY]);
  }
});

test('missing or malformed legacy drafts do not load a production draft or issued history', () => {
  for (const legacy of [undefined, '{broken', '{"version":2,"input":{"items":[]}}', '{"version":1,"input":{}}']) {
    const storage = fakeStorage({
      ...(legacy === undefined ? {} : { [PREVIEW_STORAGE_KEY]: legacy }),
      'neander-quote-v2': JSON.stringify(createPreviewInput()),
      'neander-estimates': JSON.stringify([{ id: 'existing-issued-estimate' }]),
    });
    assert.equal(loadPreviewFlow(storage), null);
    assert.deepEqual(storage.reads, [QUOTE_PREVIEW_FLOW_STORAGE_KEY, PREVIEW_STORAGE_KEY]);
  }
});

test('restricted browser storage fails safely', () => {
  assert.equal(loadPreviewFlow({ getItem() { throw new Error('Storage is unavailable'); } }), null);
});
