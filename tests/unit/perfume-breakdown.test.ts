import assert from 'node:assert/strict';
import test from 'node:test';
import { perfumeBaseBreakdown } from '../../src/components/quote-studio/perfume-breakdown';
import { REGIONS } from '../../src/lib/quote/catalog';
import { calculateQuote, sanitizeInput } from '../../src/lib/quote/engine';

// 화면의 "인원 비용 + 조향팀 출장비 = 소계" 안내는 견적 계산과 같은 금액이어야 한다
test('the perfume breakdown shown in the options matches the quote lines', () => {
  for (const region of REGIONS.map((entry) => entry.key)) {
    for (const days of [1, 2, 5]) {
      for (const volume of ['10ml', '50ml'] as const) {
        for (const guests of [20, 32, 33, 49, 50, 95, 100, 250, 600]) {
          for (const extraTeams of [0, 1, 3]) {
            const input = sanitizeInput({ region, days, hoursPerDay: 6, items: [{ key: 'acscent', options: { guests, volume, extraTeams } }] });
            const item = input.items[0];
            assert.equal(item.key, 'acscent');
            if (item.key !== 'acscent') continue;
            const lines = calculateQuote(input, 'ko').lines.filter((line) => line.service === 'acscent');
            const breakdown = perfumeBaseBreakdown(item.options, input);
            const label = `${region} ${days}d ${volume} ${guests} guests +${extraTeams}`;
            assert.equal(breakdown.guests, lines[0].amount, `guest cost: ${label}`);
            assert.equal(breakdown.travel, lines[1].amount, `team travel: ${label}`);
            assert.equal(breakdown.adjustment, lines[2]?.amount ?? 0, `minimum adjustment: ${label}`);
            assert.equal(breakdown.subtotal, lines.reduce((sum, line) => sum + line.amount, 0), `subtotal: ${label}`);
          }
        }
      }
    }
  }
});

test('100 guests, 10ml and one team in Seoul: 1,500,000 + 350,000 = 1,850,000', () => {
  const input = sanitizeInput({ region: 'seoul', days: 1, hoursPerDay: 6, items: [{ key: 'acscent', options: { guests: 100, volume: '10ml', extraTeams: 0 } }] });
  const item = input.items[0];
  assert.equal(item.key, 'acscent');
  if (item.key !== 'acscent') return;
  assert.deepEqual(perfumeBaseBreakdown(item.options, input), { guests: 1_500_000, travel: 350_000, adjustment: 0, subtotal: 1_850_000, teams: 1, days: 1, rate: 350_000 });
});
