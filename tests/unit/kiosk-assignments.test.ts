import assert from 'node:assert/strict';
import test from 'node:test';
import { PDFDocument, PDFPage } from 'pdf-lib';
import { experiences, getExperienceBySlug } from '../../src/data/experiences';
import { KIOSK } from '../../src/lib/quote/catalog';
import { calculateQuote, sanitizeInput, serviceForExperience, type KioskOptions, type QuoteInput } from '../../src/lib/quote/engine';
import { KIOSK_EXPERIENCES, getKioskAssignments, getKioskExperience, normalizeKioskExperienceSlugs } from '../../src/lib/quote/kiosk-experiences';
import { renderEstimatePdf } from '../../src/lib/quote/pdf';
import { loadPreviewFlow, QUOTE_PREVIEW_FLOW_STORAGE_KEY } from '../../src/lib/quote-preview/flow-storage';
import { PREVIEW_STORAGE_KEY } from '../../src/lib/quote-preview/model';
import { optionSummary } from '../../src/components/quote-studio/option-summary';

const a = 'ai-personal-color';
const b = 'ai-face-reading';
const c = 'ai-travel-style';
const names = (slug: string, lang: 'ko' | 'en') => getKioskExperience(slug)!.name[lang];
function inputWith(options: Partial<KioskOptions> = {}): QuoteInput {
  return sanitizeInput({ items: [{ key: 'rental', options: { kiosks: 1, mode: 'event', months: 1, ...options } }] });
}
function kioskOptions(input: QuoteInput): KioskOptions {
  return input.items.find((item) => item.key === 'rental')!.options;
}

test('published assignment choices match active experiences routed to the kiosk service', () => {
  const actual = KIOSK_EXPERIENCES.filter((experience) => getExperienceBySlug(experience.slug)).map((experience) => experience.slug);
  const expected = experiences.filter((experience) => serviceForExperience(experience.slug, experience.pillar) === 'rental').map((experience) => experience.slug);
  assert.deepEqual([...actual].sort(), [...expected].sort());
  assert.equal(new Set(actual).size, actual.length);
  for (const experience of KIOSK_EXPERIENCES) {
    assert.ok(experience.name.ko.trim());
    assert.ok(experience.name.en.trim());
  }
  assert.equal(getKioskExperience('ai-scent-soulmate'), undefined);
  assert.equal(getKioskExperience('ai-hanbok-booth'), undefined);
  assert.equal(getKioskExperience('unknown'), undefined);
});

test('slot normalization preserves order, blanks and repeated experiences without mutating incoming data', () => {
  const raw = [a, '', a, b, c];
  const before = [...raw];
  assert.deepEqual(normalizeKioskExperienceSlugs(raw, 4), [a, '', a, b]);
  assert.deepEqual(normalizeKioskExperienceSlugs(['unknown', b, null, { slug: a }], 4), ['', b, '', '']);
  assert.deepEqual(raw, before);
  for (const [count, expected] of [[0, 1], [-5, 1], [2.6, 3], [100, 4], [NaN, 1], [Infinity, 1]]) {
    assert.equal(normalizeKioskExperienceSlugs([], count).length, expected);
  }
});

test('only an absent assignment field migrates the legacy choice to the first physical device', () => {
  assert.deepEqual(normalizeKioskExperienceSlugs(undefined, 4, a), [a, '', '', '']);
  assert.deepEqual(getKioskAssignments({ kiosks: 3, experienceSlug: b }), [b, '', '']);
  for (const explicit of [[], null, {}, a, false, 7]) {
    assert.deepEqual(normalizeKioskExperienceSlugs(explicit, 3, a), ['', '', '']);
  }
  assert.deepEqual(normalizeKioskExperienceSlugs(undefined, 2, 'invalid'), ['', '']);
});

test('reducing device count removes only trailing assignments and growing it creates undecided slots', () => {
  const initial = inputWith({ kiosks: 4, experienceSlugs: [a, b, a, c] });
  const original = structuredClone(initial);
  const smaller = sanitizeInput({ ...initial, items: [{ key: 'rental', options: { ...kioskOptions(initial), kiosks: 2 } }] });
  assert.deepEqual(kioskOptions(smaller).experienceSlugs, [a, b]);
  const grown = sanitizeInput({ ...smaller, items: [{ key: 'rental', options: { ...kioskOptions(smaller), kiosks: 4 } }] });
  assert.deepEqual(kioskOptions(grown).experienceSlugs, [a, b, '', '']);
  assert.deepEqual(initial, original);
});

test('one experience on each device has no extra-content fee for different or duplicate choices in either rental mode', () => {
  for (const mode of ['event', 'monthly'] as const) {
    const baseline = inputWith({ kiosks: 4, mode, months: 3, printer: true, custom: 'brand', experienceSlugs: ['', '', '', ''] });
    baseline.days = 3;
    const base = calculateQuote(baseline, 'ko');
    for (const experienceSlugs of [[a, b, c, a], [a, a, a, a], ['', b, '', c]]) {
      const selected = sanitizeInput({ ...baseline, items: [{ key: 'rental', options: { ...kioskOptions(baseline), experienceSlugs, extraContents: 10 } }] });
      assert.equal(kioskOptions(selected).extraContents, 0);
      assert.deepEqual(kioskOptions(selected).experienceSlugs, experienceSlugs);
      assert.equal(calculateQuote(selected, 'ko').total, base.total);
      assert.equal(calculateQuote(selected, 'en').total, base.total);
      assert.ok(!calculateQuote(selected, 'en').lines.some((line) => line.label === 'Extra experiences'));
      kioskOptions(selected).extraContents = 10;
      assert.equal(calculateQuote(selected, 'ko').total, base.total, 'Direct engine callers cannot reintroduce a stale extra-content fee');
    }
  }
});

test('legacy production quantities retain their old fee until a per-device assignment array is provided', () => {
  for (const mode of ['event', 'monthly'] as const) {
    const legacy = inputWith({ kiosks: 2, mode, experienceSlug: a, extraContents: 3 });
    assert.equal(Object.hasOwn(kioskOptions(legacy), 'experienceSlugs'), false);
    assert.equal(kioskOptions(legacy).extraContents, 3);
    const assigned = inputWith({ ...kioskOptions(legacy), experienceSlugs: [a, ''] });
    const legacyPrice = calculateQuote(legacy, 'ko');
    const assignedPrice = calculateQuote(assigned, 'ko');
    assert.equal(legacyPrice.supply - assignedPrice.supply, KIOSK.extraContent * 3);
    assert.equal(legacyPrice.total - assignedPrice.total, 990_000);
  }
});

test('current and older preview drafts migrate independently of the production draft and history', () => {
  const legacy = inputWith({ kiosks: 3, experienceSlug: b, extraContents: 2, printer: true });
  for (const storageKey of [QUOTE_PREVIEW_FLOW_STORAGE_KEY, PREVIEW_STORAGE_KEY]) {
    const values: Record<string, string> = {
      [storageKey]: JSON.stringify(storageKey === PREVIEW_STORAGE_KEY ? { version: 1, input: legacy } : legacy),
      'neander-quote-v2': JSON.stringify(inputWith({ experienceSlug: c, extraContents: 9 })),
      'neander-estimates': '[{"no":"UNCHANGED"}]',
    };
    const before = structuredClone(values);
    const reads: string[] = [];
    const restored = loadPreviewFlow({ getItem(key) { reads.push(key); return values[key] ?? null; } });
    assert.ok(restored);
    assert.deepEqual(kioskOptions(restored).experienceSlugs, [b, '', '']);
    assert.equal(kioskOptions(restored).extraContents, 0);
    assert.equal(kioskOptions(restored).printer, false);
    assert.ok(!reads.includes('neander-quote-v2') && !reads.includes('neander-estimates'));
    assert.deepEqual(values, before);
    const roundtrip = loadPreviewFlow({ getItem(key) { return key === QUOTE_PREVIEW_FLOW_STORAGE_KEY ? JSON.stringify(restored) : null; } });
    assert.deepEqual(roundtrip, restored);
  }
  const cleared = inputWith({ kiosks: 3, experienceSlug: a, experienceSlugs: ['', '', ''] });
  const restored = loadPreviewFlow({ getItem(key) { return key === QUOTE_PREVIEW_FLOW_STORAGE_KEY ? JSON.stringify(cleared) : null; } });
  assert.deepEqual(kioskOptions(restored!).experienceSlugs, ['', '', '']);
});

test('summaries, quote lines and local Korean/English PDFs retain every device assignment, grouping duplicates', async (t) => {
  const drawn: string[] = [];
  const drawText = PDFPage.prototype.drawText;
  t.mock.method(PDFPage.prototype, 'drawText', function (this: PDFPage, text: string, options: Parameters<PDFPage['drawText']>[1]) {
    drawn.push(text);
    return drawText.call(this, text, options);
  });
  const input = inputWith({ kiosks: 4, experienceSlugs: [a, '', a, c], printer: true });
  const before = structuredClone(input);
  for (const lang of ['ko', 'en'] as const) {
    drawn.length = 0;
    const quote = calculateQuote(input, lang);
    const details = quote.lines.filter((line) => line.service === 'rental').map((line) => line.detail).join(' ');
    const summary = optionSummary(input.items[0], lang).join(' ');
    for (const text of [details, summary]) {
      // 같은 체험은 한 번만 적고 몇 대인지(어느 기기인지) 붙인다
      assert.equal(text.split(names(a, lang)).length - 1, 1);
      assert.ok(text.includes(names(c, lang)));
      assert.match(text, lang === 'ko' ? /미정|상담 후 결정/ : /later|undecided|TBD/i);
    }
    // 견적서 줄에는 모든 기기 번호가 남는다: 1·3번 A / 4번 C / 2번 미정
    assert.ok(details.includes(lang === 'ko' ? `1·3번 키오스크: ${names(a, lang)}` : `Kiosks 1, 3: ${names(a, lang)}`));
    assert.ok(details.includes(lang === 'ko' ? `4번 키오스크: ${names(c, lang)}` : `Kiosk 4: ${names(c, lang)}`));
    assert.ok(details.includes(lang === 'ko' ? '2번 키오스크: 상담 후 결정' : 'Kiosk 2: Decide later'));
    // 요약에는 체험별 대수
    assert.ok(summary.includes(lang === 'ko' ? `${names(a, lang)} 2대` : `${names(a, lang)} ×2`));
    const bytes = await renderEstimatePdf(input, {
      estimateNo: 'TEST-KIOSK-ASSIGNMENTS', issuedAt: new Date('2026-09-28T00:00:00Z'),
      recipient: { name: 'Local Test', email: 'preview@example.com' }, lang,
    });
    assert.equal(Buffer.from(bytes).subarray(0, 4).toString(), '%PDF');
    assert.ok((await PDFDocument.load(bytes)).getPageCount() >= 1);
    const text = drawn.join('').replace(/\s+/g, '');
    assert.ok(text.includes(names(a, lang).replace(/\s+/g, '')));
    assert.ok(text.includes(names(c, lang).replace(/\s+/g, '')));
    assert.ok(text.includes(quote.total.toLocaleString('en-US')));
  }
  assert.deepEqual(input, before);
});
