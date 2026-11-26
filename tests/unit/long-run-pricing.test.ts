import assert from 'node:assert/strict';
import test from 'node:test';
import { KIOSK, LONG_RUN, PHOTO_BOOTH } from '../../src/lib/quote/catalog';
import { calculateQuote, defaultOptions, normalizePerfumeStaffing, perfumeHoursSuggestion, sanitizeInput, type QuoteInput } from '../../src/lib/quote/engine';
import { normalizePreviewInput } from '../../src/lib/quote-preview/flow-storage';
import { optionSummary } from '../../src/components/quote-studio/option-summary';

/* 2026-11-27: 운영일이 길면 키오스크·포토부스를 상시 운영(월 단위) 요금으로 계산한다 */

const schedule = (days: number, hoursPerDay = 6, extra: Partial<QuoteInput> = {}) => ({
  eventType: 'popup', eventDate: '', days, hoursPerDay, attendees: 300, region: 'seoul', extraStaff: 0, ...extra,
});
const kiosk = (days: number, hoursPerDay = 6, extra: Partial<QuoteInput> = {}) =>
  normalizePreviewInput({ ...schedule(days, hoursPerDay, extra), items: [defaultOptions('rental')] });
const booth = (days: number, hoursPerDay = 6) =>
  normalizePreviewInput({ ...schedule(days, hoursPerDay), items: [defaultOptions('photoBooth')] });

test('monthly rates are KRW 3M per kiosk and KRW 4M per photo booth', () => {
  assert.equal(KIOSK.monthlyPerKiosk, 3_000_000);
  assert.equal(PHOTO_BOOTH.monthlyPerBooth, 4_000_000);
});

test('a short kiosk rental keeps daily pricing', () => {
  for (const days of [1, LONG_RUN.minDays - 1, 11]) {
    const item = kiosk(days).items[0];
    assert.equal(item.key === 'rental' && item.options.mode, 'event', `${days} days`);
  }
});

test('a long kiosk rental switches to the monthly rate once it is cheaper', () => {
  const input = kiosk(12);
  const item = input.items[0];
  assert.ok(item.key === 'rental' && item.options.mode === 'monthly' && item.options.autoMonthly && item.options.months === 1);
  const quote = calculateQuote(input);
  assert.equal(quote.supply, KIOSK.monthlyPerKiosk);
  assert.ok(quote.notes.some((note) => note.includes('상시 운영 요금')));
});

test('the 14-day, 14-hour promotion kiosk is priced at one month instead of daily rent plus overtime', () => {
  const input = kiosk(14, 14, { setupDayBefore: true, attendees: 1400 });
  const quote = calculateQuote(input);
  // 상시 운영 1개월 + 전날 설치 — 연장 운영비는 월 요금에 들어 있다
  assert.equal(quote.supply, KIOSK.monthlyPerKiosk + 300_000);
  assert.ok(!quote.lines.some((line) => line.label === '연장 운영'));
});

test('every started month is charged', () => {
  const item = kiosk(31).items[0];
  assert.ok(item.key === 'rental' && item.options.months === 2);
  assert.equal(calculateQuote(kiosk(31)).supply, KIOSK.monthlyPerKiosk * 2);
});

test('shortening the run returns an automatic monthly rental to daily pricing', () => {
  const long = kiosk(14);
  const short = normalizePerfumeStaffing({ ...long, days: 3 });
  const item = short.items[0];
  assert.ok(item.key === 'rental' && item.options.mode === 'event' && item.options.months === 1 && item.options.autoMonthly === undefined);
});

test('a monthly kiosk the customer chose stays monthly at any length', () => {
  const input = sanitizeInput({ ...schedule(1), items: [{ key: 'rental', options: { mode: 'monthly', kiosks: 1, months: 3 } }] });
  const item = input.items[0];
  assert.ok(item.key === 'rental' && item.options.mode === 'monthly' && item.options.months === 3 && !item.options.autoMonthly);
});

test('a long photo booth run switches to the monthly booth rate and keeps one roll a month', () => {
  const input = booth(LONG_RUN.minDays);
  const item = input.items[0];
  assert.ok(item.key === 'photoBooth' && item.options.mode === 'monthly' && item.options.months === 1);
  const quote = calculateQuote(input);
  assert.equal(quote.supply, PHOTO_BOOTH.monthlyPerBooth);
  assert.match(optionSummary(item, 'ko')[0], /상시 운영/);
  // 되돌리면 저장값에서 상시 운영 표시가 사라진다
  const back = normalizePerfumeStaffing({ ...input, days: 2 }).items[0];
  assert.ok(back.key === 'photoBooth' && back.options.mode === undefined && back.options.months === undefined);
});

test('the automatic monthly choice survives a saved draft and the PDF request', () => {
  const restored = sanitizeInput(JSON.parse(JSON.stringify(kiosk(20))));
  const item = restored.items[0];
  assert.ok(item.key === 'rental' && item.options.mode === 'monthly' && item.options.autoMonthly);
});

test('an extra perfume team caused by a few guests suggests a slightly longer day', () => {
  const input = sanitizeInput({ ...schedule(1, 6, { region: 'gyeongsang' }), items: [{ key: 'acscent', options: { guests: 250 } }] });
  const tip = perfumeHoursSuggestion(input);
  assert.deepEqual(tip && { hours: tip.hours, teams: tip.teams }, { hours: 7, teams: 1 });
  assert.equal(tip?.saving, 500_000);
  // 한 팀으로 충분하면 제안하지 않는다
  assert.equal(perfumeHoursSuggestion(sanitizeInput({ ...schedule(1), items: [{ key: 'acscent', options: { guests: 200 } }] })), null);
});
