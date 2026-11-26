import assert from 'node:assert/strict';
import test from 'node:test';
import { buildJourneys, describeAction, type QuoteAction, type QuoteActionBatch } from '../../src/lib/analytics/quote-behavior';

// 견적 보고서(HWPX·PDF) 발급은 'x' 행동에 report_hwpx · report_pdf 로 남는다.
// 관리자 「견적 분석」에서 「제출 오류」로 보이거나 미제출로 세지면 안 된다.

const batch = (jid: string, actions: QuoteAction[]): QuoteActionBatch => ({
  jid, seq: 0, ts: new Date('2026-11-26T00:00:00Z'), actions,
  vid: 'v1', sid: 's1', internal: false, device: 'desktop', channel: 'direct', source: '', browser: 'chrome', locale: 'ko',
});

test('보고서 발급은 오류가 아니라 보고서 발급으로 읽힌다', () => {
  assert.equal(describeAction([0, 'x', 'report_hwpx']), '보고서 발급 (HWPX)');
  assert.equal(describeAction([0, 'x', 'report_pdf']), '보고서 발급 (PDF)');
  assert.equal(describeAction([0, 'x', 'error']), '제출 오류');
});

test('보고서만 받은 여정은 제출로 센다', () => {
  const [j] = buildJourneys([batch('j1', [[1, 'v', 'form'], [2, 'x', 'report_pdf']])]);
  assert.equal(j.submitted, 'report');
});

test('한 여정에 여럿이면 상담 요청 > 보고서 > 가견적서 순', () => {
  const [a] = buildJourneys([batch('a', [[1, 'x', 'report_hwpx'], [2, 'x', 'pdf']])]);
  assert.equal(a.submitted, 'report');
  const [b] = buildJourneys([batch('b', [[1, 'x', 'report_hwpx'], [2, 'x', 'request'], [3, 'x', 'pdf']])]);
  assert.equal(b.submitted, 'request');
});
