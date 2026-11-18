import assert from 'node:assert/strict';
import test from 'node:test';
import { COMMON } from '../../src/lib/quote/catalog';
import { calculateQuote, getOvertimeUnits, sanitizeInput } from '../../src/lib/quote/engine';

const overtimeLine = (raw: Record<string, unknown>, lang: 'ko' | 'en' = 'ko') =>
  calculateQuote(sanitizeInput(raw), lang).lines.find((line) => /연장 운영|Extended hours/.test(line.label));

test('extended hours are billed for every on-site device and person', () => {
  const raw = {
    days: 2, hoursPerDay: 8, extraStaff: 2,
    items: [
      { key: 'photoBooth', options: { booths: 1 } },
      { key: 'rental', options: { mode: 'event', kiosks: 2 } },
      { key: 'acscent', options: { guests: 100, analysisKiosks: 1 } },
    ],
  };
  // 기기: 포토부스 1 + 키오스크 2 + 분석용 키오스크 1 = 4, 인력: 추가 2 + 조향 1팀 2명 = 4
  assert.deepEqual(getOvertimeUnits(sanitizeInput(raw)), { devices: 4, staff: 4 });
  const line = overtimeLine(raw)!;
  assert.equal(line.amount, COMMON.extraHourPerDay * 8 * 2 * 2);
  assert.match(line.detail, /기기 4대 \+ 인력 4명/);
  assert.match(overtimeLine(raw, 'en')!.detail, /4 device\(s\) \+ 4 staff/);
});

test('no extended-hours line within the base hours, for monthly kiosks, or for consultation-only items', () => {
  assert.equal(overtimeLine({ hoursPerDay: COMMON.baseHours, items: [{ key: 'photoBooth', options: { booths: 3 } }] }), undefined);
  assert.equal(overtimeLine({ hoursPerDay: 10, items: [{ key: 'rental', options: { mode: 'monthly', kiosks: 4 } }] }), undefined);
  assert.equal(overtimeLine({ hoursPerDay: 10, items: [{ key: 'mediaArt', options: {} }] }), undefined);
});
