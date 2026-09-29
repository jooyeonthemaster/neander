import assert from 'node:assert/strict';
import test from 'node:test';
import { PDFDocument, PDFPage } from 'pdf-lib';
import { COMMON, CUSTOM_DEV, PHOTO_BOOTH } from '../../src/lib/quote/catalog';
import { calculateQuote, defaultOptions, sanitizeInput, type PhotoBoothOptions, type QuoteInput } from '../../src/lib/quote/engine';
import { PHOTO_BOOTH_TEMPLATES, getPhotoBoothTemplates, normalizePhotoBoothTemplateSlugs } from '../../src/lib/quote/photo-booth-templates';
import { renderEstimatePdf } from '../../src/lib/quote/pdf';
import { loadPreviewFlow, QUOTE_PREVIEW_FLOW_STORAGE_KEY } from '../../src/lib/quote-preview/flow-storage';
import { optionSummary } from '../../src/components/quote-studio/option-summary';

const slugs = PHOTO_BOOTH_TEMPLATES.slice(0, 4).map((template) => template.slug);
const withVat = (amount: number) => Math.round(amount * (1 + COMMON.vatRate));

function inputWith(options: Partial<PhotoBoothOptions> = {}): QuoteInput {
  return sanitizeInput({ items: [{ ...defaultOptions('photoBooth'), options: { ...defaultOptions('photoBooth').options, ...options } }] });
}

function boothOptions(input: QuoteInput): PhotoBoothOptions {
  return input.items.find((item) => item.key === 'photoBooth')!.options;
}

test('only unique catalogue slugs survive untrusted template selection, in selection order', () => {
  assert.ok(slugs.length >= 4);
  assert.equal(new Set(PHOTO_BOOTH_TEMPLATES.map((template) => template.slug)).size, PHOTO_BOOTH_TEMPLATES.length);
  const raw = [slugs[2], 'not-a-template', slugs[0], slugs[2], null, 42, { slug: slugs[1] }, '../../private'];
  const before = structuredClone(raw);
  assert.deepEqual(normalizePhotoBoothTemplateSlugs(raw), [slugs[2], slugs[0]]);
  assert.deepEqual(getPhotoBoothTemplates([slugs[2], 'not-a-template', slugs[0], slugs[2]]).map((template) => template.slug), [slugs[2], slugs[0]]);
  assert.deepEqual(raw, before);
  for (const malformed of [undefined, null, false, 12, slugs[0], { templateSlugs: slugs }]) {
    assert.deepEqual(normalizePhotoBoothTemplateSlugs(malformed), []);
  }
  for (const template of PHOTO_BOOTH_TEMPLATES) {
    assert.ok(template.name.ko.trim());
    assert.ok(template.name.en.trim());
  }
});

test('an explicit selection controls ready-made charges while omitted selection preserves legacy quantities', () => {
  for (const [raw, expected] of [[-1, 0], [4, 4], [100, 20]] as const) {
    const input = inputWith({ extraStyles: raw });
    const legacy = boothOptions(input);
    assert.equal(legacy.extraStyles, expected);
    assert.equal(Object.hasOwn(legacy, 'templateSlugs'), false);
    const details = calculateQuote(input, 'ko').lines.map((line) => line.detail).join(' ');
    const summary = optionSummary(input.items[0], 'ko').join(' ');
    for (const template of PHOTO_BOOTH_TEMPLATES) {
      assert.ok(!details.includes(template.name.ko), 'A legacy quantity is not a choice of every catalogue template');
      assert.ok(!summary.includes(template.name.ko));
    }
  }
  for (const selection of [[], [slugs[0]], slugs.slice(0, 2), slugs.slice(0, 3), slugs]) {
    const actual = boothOptions(inputWith({ templateSlugs: selection, extraStyles: 20 }));
    assert.deepEqual(actual.templateSlugs, selection);
    assert.equal(actual.extraStyles, Math.max(0, selection.length - PHOTO_BOOTH.includedStyles));
  }
  const malformed = sanitizeInput({ items: [{ key: 'photoBooth', options: { templateSlugs: 'invalid', extraStyles: 20 } }] });
  assert.deepEqual(boothOptions(malformed).templateSlugs, []);
  assert.equal(boothOptions(malformed).extraStyles, 0);
});

test('two existing templates are included; every additional template costs 200000 once, including VAT', () => {
  const base = calculateQuote(inputWith(), 'ko');
  for (let count = 0; count <= slugs.length; count++) {
    const quote = calculateQuote(inputWith({ templateSlugs: slugs.slice(0, count) }), 'ko');
    const extra = Math.max(0, count - 2);
    assert.equal(quote.supply - base.supply, extra * 200_000);
    assert.equal(quote.total - base.total, extra * 220_000);
  }
  const before = inputWith({ booths: 3, templateSlugs: slugs.slice(0, 2) });
  before.days = 5;
  const after = structuredClone(before);
  boothOptions(after).templateSlugs = slugs.slice(0, 3);
  // The price engine derives counts itself, even when a caller's extraStyles is stale.
  boothOptions(after).extraStyles = 20;
  assert.equal(calculateQuote(after, 'ko').total - calculateQuote(before, 'ko').total, withVat(PHOTO_BOOTH.extraStyle));
});

test('custom styles cost 500000 independently and are never counted as an existing-template surcharge', () => {
  const base = calculateQuote(inputWith({ templateSlugs: slugs.slice(0, 2) }), 'ko');
  const customOnly = calculateQuote(inputWith({ templateSlugs: slugs.slice(0, 2), customStyles: 1 }), 'ko');
  const both = calculateQuote(inputWith({ templateSlugs: slugs.slice(0, 3), customStyles: 1 }), 'ko');
  assert.equal(customOnly.supply - base.supply, 500_000);
  assert.equal(customOnly.total - base.total, 550_000);
  assert.equal(both.supply - base.supply, 700_000);
  assert.equal(both.total - base.total, 770_000);
  const customLines = both.lines.filter((line) => line.amount === CUSTOM_DEV.boothStyle);
  assert.equal(customLines.length, 1);
  assert.equal(both.lines.filter((line) => line.amount === PHOTO_BOOTH.extraStyle).length, 1);
});

test('removing selections removes only their surcharge and names, while custom work remains', () => {
  const full = inputWith({ templateSlugs: slugs.slice(0, 3), customStyles: 2 });
  const removed = inputWith({ templateSlugs: slugs.slice(0, 2), customStyles: 2, extraStyles: 1 });
  assert.equal(calculateQuote(full, 'ko').total - calculateQuote(removed, 'ko').total, 220_000);
  assert.equal(boothOptions(removed).extraStyles, 0);
  assert.equal(boothOptions(removed).customStyles, 2);
  const names = optionSummary(removed.items[0], 'ko').join(' ');
  assert.ok(names.includes(PHOTO_BOOTH_TEMPLATES[0].name.ko));
  assert.ok(!names.includes(PHOTO_BOOTH_TEMPLATES[2].name.ko));
  const cleared = inputWith({ templateSlugs: [], customStyles: 2, extraStyles: 1 });
  assert.equal(calculateQuote(cleared, 'ko').total, calculateQuote(removed, 'ko').total);
});

test('JSON draft restoration retains explicit selections and custom counts without reviving removed templates', () => {
  for (const templateSlugs of [slugs.slice(0, 3), []]) {
    const input = inputWith({ templateSlugs, customStyles: 1 });
    const bytes = JSON.stringify(input);
    const reads: string[] = [];
    const restored = loadPreviewFlow({ getItem(key) { reads.push(key); return key === QUOTE_PREVIEW_FLOW_STORAGE_KEY ? bytes : null; } });
    assert.deepEqual(restored, input);
    assert.deepEqual(reads, [QUOTE_PREVIEW_FLOW_STORAGE_KEY]);
    assert.deepEqual(boothOptions(restored!).templateSlugs, templateSlugs);
    assert.equal(calculateQuote(restored!, 'ko').total, calculateQuote(input, 'ko').total);
  }
});

test('the estimate and actual Korean/English PDF include chosen template names and the same final amount', async (t) => {
  const drawn: string[] = [];
  const drawText = PDFPage.prototype.drawText;
  t.mock.method(PDFPage.prototype, 'drawText', function (this: PDFPage, text: string, options: Parameters<PDFPage['drawText']>[1]) {
    drawn.push(text);
    return drawText.call(this, text, options);
  });
  const input = inputWith({ templateSlugs: slugs.slice(0, 3), customStyles: 1 });
  const before = structuredClone(input);
  for (const lang of ['ko', 'en'] as const) {
    drawn.length = 0;
    const quote = calculateQuote(input, lang);
    const selected = getPhotoBoothTemplates(slugs.slice(0, 3));
    const descriptions = quote.lines.filter((line) => line.service === 'photoBooth').map((line) => line.detail).join(' ');
    const summary = optionSummary(input.items[0], lang).join(' ');
    for (const template of selected) {
      assert.ok(descriptions.includes(template.name[lang]));
      assert.ok(summary.includes(template.name[lang]));
    }
    const bytes = await renderEstimatePdf(input, {
      estimateNo: 'TEST-TEMPLATES-LOCAL', issuedAt: new Date('2026-09-28T00:00:00Z'),
      recipient: { name: 'Preview Test', email: 'preview@example.com' }, lang,
    });
    assert.equal(Buffer.from(bytes).subarray(0, 4).toString(), '%PDF');
    assert.ok((await PDFDocument.load(bytes)).getPageCount() >= 1);
    const text = drawn.join('').replace(/\s+/g, '');
    for (const template of selected) assert.ok(text.includes(template.name[lang].replace(/\s+/g, '')));
    assert.ok(text.includes(quote.total.toLocaleString('en-US')));
    assert.ok(text.includes('200,000'));
    assert.ok(text.includes('500,000'));
  }
  assert.deepEqual(input, before);
});
