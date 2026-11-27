import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateQuote, normalizePerfumeStaffing, type QuoteInput, type QuoteItem } from '../../src/lib/quote/engine';
import { BUDGET_EXAMPLES } from '../../src/data/insights-questions';
import { getInsight } from '../../src/data/insights';

/* 2026-11-27: 「예산별로 고르기」 안내의 금액이 온라인 견적과 같은지 — 가격표를 바꾸면 글도 함께 바뀌어야 한다 */

const booth = (booths = 1): QuoteItem => ({ key: 'photoBooth', options: { booths, extraStyles: 0, extraPrintRolls: 0, photocard: false, wrapping: false } });
const kiosk = (kiosks = 1): QuoteItem => ({ key: 'rental', options: { mode: 'event', kiosks, months: 1, printer: false, extraContents: 0, custom: 'none' } });
const perfume = (guests: number): QuoteItem => ({ key: 'acscent', options: { guests, volume: '10ml', extraTeams: 0, customScent: false, premiumPackaging: false } });

function supply(items: QuoteItem[], days = 1, extraStaff = 0): number {
  const input: QuoteInput = normalizePerfumeStaffing({ eventType: 'corporate', eventDate: '', days, hoursPerDay: 6, attendees: 100, region: 'seoul', extraStaff, items });
  return calculateQuote(input, 'ko').supply;
}

test('budget guide prices match the online estimate', () => {
  const cases: [keyof typeof BUDGET_EXAMPLES, number][] = [
    ['kiosk1', supply([kiosk(1)])],
    ['kiosk1Staff', supply([kiosk(1)], 1, 1)],
    ['perfumeMin', supply([perfume(32)])],
    ['booth1Staff', supply([booth(1)], 1, 1)],
    ['kiosk2Staff', supply([kiosk(2)], 1, 1)],
    ['perfume100', supply([perfume(100)])],
    ['boothKioskStaff', supply([booth(1), kiosk(1)], 1, 1)],
    ['booth2Staff2', supply([booth(2)], 1, 2)],
    ['perfume100KioskStaff', supply([perfume(100), kiosk(1)], 1, 1)],
    ['perfume200', supply([perfume(200)])],
    ['perfume200BoothKioskStaff2', supply([perfume(200), booth(1), kiosk(1)], 1, 2)],
    ['booth3DaysStaff', supply([booth(1)], 3, 1)],
    ['kiosk2x3DaysStaff', supply([kiosk(2)], 3, 1)],
  ];
  for (const [key, expected] of cases) assert.equal(BUDGET_EXAMPLES[key], expected, key);
});

test('question guides are registered with both languages', () => {
  for (const slug of ['event-ai-experience-by-budget', 'ai-photo-booth-vs-kiosk']) {
    const guide = getInsight(slug);
    assert.ok(guide, slug);
    assert.ok(guide.ko.blocks.length > 3 && guide.en.blocks.length > 2, slug);
  }
});
